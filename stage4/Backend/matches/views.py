from datetime import date
from decimal import Decimal
from django.utils import timezone
from django.db.models import Q

from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date, parse_time
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Invitation, Match, Participation, Sport
from .serializers import InvitationSerializer, MatchDetailSerializer, MatchSerializer, PaymentStatusSerializer
from users.views import add_points

# /matches/ : GET browses matches (anyone), POST creates one (logged in only)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def match_list(request):
    if request.method == 'POST':
        return create_match(request)
    return get_matches(request)


SLOT_TAKEN = 'This venue is already booked at this date and time.'


# Double Booking Prevention: is this venue already booked at this date and time? (cancelled matches don't count)
def slot_is_taken(location, match_date, match_time, exclude_match_id=None):
    matches = Match.objects.filter(location__iexact=location, date=match_date, time=match_time)
    matches = matches.exclude(status=Match.Status.CANCELLED).exclude(pk=exclude_match_id)
    return matches.exists()


# 5 Create a Match
def create_match(request):
    serializer = MatchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    # save the match and the creator's spot together, or neither
    with transaction.atomic():
        # Double Booking Prevention: lock the sport so two bookings at the same moment wait in line
        Sport.objects.select_for_update().get(pk=data['sport'].pk)
        if slot_is_taken(data['location'], data['date'], data['time']):
            return Response({'error': SLOT_TAKEN}, status=status.HTTP_400_BAD_REQUEST)

        opponent = data.get('opponent')
        if opponent == request.user:
            return Response({'error': 'You cannot be your own opponent.'}, status=status.HTTP_400_BAD_REQUEST)

       host_expiration = timezone.now() + timedelta(minutes=5)
        
        match = serializer.save(
            creator=request.user,
            host_payment_expires_at=host_expiration,
            status='pending_payment'
        )
        # the creator is the first player in the match
        Participation.objects.create(user=request.user, match=match, payment_amount=match.share_per_player())
        add_points(request.user, 'match_scheduling')
        # the opponent plays in the match too, so they take a spot and pay their share
        if opponent:
            _, error = add_player(match, opponent)
            if error:
                transaction.set_rollback(True)
                return Response({'error': f'Could not add the opponent: {error}'}, status=status.HTTP_400_BAD_REQUEST)

    return Response(MatchSerializer(match).data, status=status.HTTP_201_CREATED)


def match_spots(match):
    return {
        'id': match.id,
        'status': match.status,
        'players_count': match.players_count(),
        'spots_left': match.spots_left(),
    }


# puts a player in a match, used by Join and by accepting an invitation
# (the match must already be locked with select_for_update)
def add_player(match, user):
    if match.status not in (Match.Status.OPEN, Match.Status.FULL):
        return None, 'This match is not open.'

    participation = Participation.objects.filter(user=user, match=match).first()
    if participation and participation.status == Participation.Status.JOINED:
        return None, 'You already joined this match.'

    if match.status == Match.Status.FULL or match.spots_left() <= 0:
        return None, 'This match is full.'

    if participation:
        # the player left before and is joining again
        participation.status = Participation.Status.JOINED
        participation.payment_amount = match.share_per_player()
        participation.payment_status = Participation.PaymentStatus.PENDING
        participation.save()
    else:
        participation = Participation.objects.create(user=user, match=match, payment_amount=match.share_per_player())

    if match.spots_left() == 0:
        match.status = Match.Status.FULL
        match.save()
    
    return participation, None
    add_points(user, 'participation')

# 4 Join a Match
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_match(request, match_id):
    cancel_expired_unpaid_participations_internal()
    with transaction.atomic():
        # select_for_update locks this match row until the transaction ends,
        # so two players can't take the last spot at the same time
        match = get_object_or_404(Match.objects.select_for_update(), pk=match_id)
        participation, error = add_player(match, request.user)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
        add_points(request.user, 'participation')
    return Response({
        **match_spots(match),
        'my_share': str(participation.payment_amount),
        'payment_status': participation.payment_status,
    }, status=status.HTTP_200_OK)


# 4 Leave a Match
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_match(request, match_id):
    with transaction.atomic():
        # lock the match too, so a leave and a join don't change the count at the same time
        match = get_object_or_404(Match.objects.select_for_update(), pk=match_id)

        if match.creator == request.user:
            return Response({'error': 'The creator cannot leave their own match.'}, status=status.HTTP_400_BAD_REQUEST)

        participation = Participation.objects.filter(
            user=request.user, match=match, status=Participation.Status.JOINED
        ).first()
        if not participation:
            return Response({'error': 'You are not in this match.'}, status=status.HTTP_400_BAD_REQUEST)

        participation.status = Participation.Status.LEFT
        participation.save()

        if match.status == Match.Status.FULL:
            match.status = Match.Status.OPEN
            match.save()

    return Response(match_spots(match), status=status.HTTP_200_OK)


# 6 + 7: the creator sees each player's share and payment status
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_payments(request, match_id):
    match = get_object_or_404(Match, pk=match_id)
    if match.creator != request.user:
        return Response({'error': 'Only the match creator can see payments.'}, status=status.HTTP_403_FORBIDDEN)

    players = match.participations.filter(status=Participation.Status.JOINED).select_related('user')
    paid = [p for p in players if p.payment_status == Participation.PaymentStatus.PAID]

    return Response({
        'match_id': match.id,
        'total_cost': str(match.total_cost),
        'max_players': match.max_players,
        'share_per_player': str(match.share_per_player()),
        'paid_count': len(paid),
        'pending_count': len(players) - len(paid),
        'total_collected': str(sum((p.payment_amount for p in paid), Decimal('0.00'))),
        'players': PaymentStatusSerializer(players, many=True).data,
    })




# 6 + 7: a player sees their own share and payment status
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_payment(request, match_id):
    match = get_object_or_404(Match, pk=match_id)
    participation = Participation.objects.filter(
        match=match, user=request.user, status=Participation.Status.JOINED
    ).first()
    if not participation:
        return Response({'error': 'You are not in this match.'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'match_id': match.id,
        'total_cost': str(match.total_cost),
        'my_share': str(participation.payment_amount),
        'payment_status': participation.payment_status,
    })


# the only fields the list can be sorted by ("-" means newest/highest first)
ORDERING_FIELDS = ['date', '-date', 'time', '-time', 'total_cost', '-total_cost']


# 2 Browse & Filter Matches: filtering, ordering and pages of 10
def get_matches(request):
    matches = Match.objects.filter(date__gte=date.today()).exclude(status='pending_payment').select_related('sport', 'creator')
    # only upcoming matches, so old games don't show up in the list
    matches = Match.objects.filter(date__gte=date.today()).select_related('sport', 'creator')

    sport_id = request.GET.get('sport')
    if sport_id:
        if not sport_id.isdigit():
            return Response({'error': 'sport must be a sport ID.'}, status=status.HTTP_400_BAD_REQUEST)
        matches = matches.filter(sport_id=sport_id)

    match_status = request.GET.get('status')
    if match_status:
        if match_status not in Match.Status.values:
            return Response({'error': 'Unknown match status.'}, status=status.HTTP_400_BAD_REQUEST)
        matches = matches.filter(status=match_status)

    match_date = request.GET.get('date')
    if match_date:
        if not parse_date(match_date):
            return Response({'error': 'date must be YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        matches = matches.filter(date=match_date)

    # matches starting at this time or later
    start_time = request.GET.get('time')
    if start_time:
        if not parse_time(start_time):
            return Response({'error': 'time must be HH:MM.'}, status=status.HTTP_400_BAD_REQUEST)
        matches = matches.filter(time__gte=start_time)

    location = request.GET.get('location', '').strip()
    if location:
        matches = matches.filter(location__icontains=location)

    ordering = request.GET.get('ordering', 'date')
    if ordering not in ORDERING_FIELDS:
        return Response({'error': f'ordering must be one of: {", ".join(ORDERING_FIELDS)}'},
                        status=status.HTTP_400_BAD_REQUEST)
    matches = matches.order_by(ordering, 'time', 'id')

    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_matches = paginator.paginate_queryset(matches, request)

    serializer = MatchSerializer(paginated_matches, many=True)
    return paginator.get_paginated_response(serializer.data)


# 3 View Match Details: everything about one match, its host and its players
@api_view(['GET'])
@permission_classes([AllowAny])
def get_match_detail(request, match_id):
    match = get_object_or_404(Match.objects.select_related('sport', 'creator'), pk=match_id)
    serializer = MatchDetailSerializer(match)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 8 Invite Players: the creator invites a player by email
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_player(request, match_id):
    match = get_object_or_404(Match, pk=match_id)
    if match.creator != request.user:
        return Response({'error': 'Only the match creator can invite players.'}, status=status.HTTP_403_FORBIDDEN)

    if match.status != Match.Status.OPEN:
        return Response({'error': 'You can only invite players to an open match.'}, status=status.HTTP_400_BAD_REQUEST)

    email = str(request.data.get('email', '')).strip()
    receiver = get_user_model().objects.filter(email__iexact=email).first() if email else None
    if not receiver:
        return Response({'error': 'No player found with this email.'}, status=status.HTTP_404_NOT_FOUND)

    if receiver == request.user:
        return Response({'error': 'You cannot invite yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    if Participation.objects.filter(match=match, user=receiver, status=Participation.Status.JOINED).exists():
        return Response({'error': 'This player is already in the match.'}, status=status.HTTP_400_BAD_REQUEST)

    invitation, created = Invitation.objects.get_or_create(match=match, receiver=receiver,
                                                           defaults={'sender': request.user})
    if not created:
        if invitation.status == Invitation.Status.PENDING:
            return Response({'error': 'This player is already invited.'}, status=status.HTTP_400_BAD_REQUEST)
        # they declined (or left after accepting), so send it again
        invitation.status = Invitation.Status.PENDING
        invitation.save()

    return Response(InvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)


# 8: a player sees the invitations sent to them, newest first
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_invitations(request):
    invitations = (Invitation.objects.filter(receiver=request.user)
                   .select_related('sender', 'match__sport', 'match__creator')
                   .order_by('-id'))
    return Response(InvitationSerializer(invitations, many=True).data)


# 8: the player accepts, which joins them to the match
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_invitation(request, invitation_id):
    cancel_expired_unpaid_participations_internal()
    with transaction.atomic():
        # only the receiver can find their invitation, anyone else gets 404
        invitation = get_object_or_404(Invitation.objects.select_for_update(), pk=invitation_id, receiver=request.user)
        if invitation.status != Invitation.Status.PENDING:
            return Response({'error': 'You already answered this invitation.'}, status=status.HTTP_400_BAD_REQUEST)

        # lock the match like Join does, so the last spot can't be taken twice
        match = Match.objects.select_for_update().get(pk=invitation.match_id)
        participation, error = add_player(match, request.user)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        invitation.status = Invitation.Status.ACCEPTED
        invitation.save()

    return Response({
        **InvitationSerializer(invitation).data,
        'my_share': str(participation.payment_amount),
        'payment_status': participation.payment_status,
    }, status=status.HTTP_200_OK)


# 8: the player declines
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_invitation(request, invitation_id):
    invitation = get_object_or_404(Invitation, pk=invitation_id, receiver=request.user)
    if invitation.status != Invitation.Status.PENDING:
        return Response({'error': 'You already answered this invitation.'}, status=status.HTTP_400_BAD_REQUEST)

    invitation.status = Invitation.Status.DECLINED
    invitation.save()
    return Response(InvitationSerializer(invitation).data, status=status.HTTP_200_OK)
    # 9: the creator can edit a match 
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def edit_match(request, match_id):
    match = get_object_or_404(Match, pk=match_id)

    if match.creator != request.user:
        return Response({'error': 'Only the match creator can edit this match.'},
                        status=status.HTTP_403_FORBIDDEN)

    if match.status == Match.Status.CANCELLED:
        return Response({'error': 'A cancelled match cannot be edited.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # the opponent is chosen when the match is created, it can't be swapped later
    if 'opponent_id' in request.data:
        return Response({'error': 'The opponent cannot be changed after the match is created.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # PUT = full update, PATCH = partial update
    serializer = MatchSerializer(match, data=request.data, partial=(request.method == 'PATCH'))
    serializer.is_valid(raise_exception=True)

    # Double Booking Prevention: the new venue, date or time must not be booked already
    data = serializer.validated_data
    with transaction.atomic():
        Sport.objects.select_for_update().get(pk=match.sport_id)
        if slot_is_taken(data.get('location', match.location), data.get('date', match.date),
                         data.get('time', match.time), exclude_match_id=match.id):
            return Response({'error': SLOT_TAKEN}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
    return Response(serializer.data)
    # 10: the creator can cancel a match
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_match(request, match_id):
    match = get_object_or_404(Match, pk=match_id)

    if match.creator != request.user:
        return Response({'error': 'Only the match creator can cancel this match.'},
                        status=status.HTTP_403_FORBIDDEN)

    if match.status == Match.Status.CANCELLED:
        return Response({'error': 'This match is already cancelled.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if match.date < date.today():
        return Response({'error': 'A match that already took place cannot be cancelled.'},
                        status=status.HTTP_400_BAD_REQUEST)

    match.status = Match.Status.CANCELLED
    match.save(update_fields=['status'])
    return Response(MatchSerializer(match).data)

# 11: view my matches
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_matches(request):
    matches = (
        Match.objects
        .filter(
            Q(creator=request.user) |
            Q(participations__user=request.user,
              participations__status=Participation.Status.JOINED)
        )
        .select_related('sport', 'creator', 'opponent', 'winner')
        .distinct()
        .order_by('date', 'time')
    )
    return Response(MatchSerializer(matches, many=True).data)
    # confirm
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request, match_id):
    match = get_object_or_404(Match, pk=match_id)
    
if match.creator != request.user:
        return Response(
            {'error': 'You are not authorized to confirm payment for this match as you are not its creator.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    if match.host_payment_expires_at and timezone.now() > match.host_payment_expires_at:
        return Response({'error': 'Payment window has expired.'}, status=status.HTTP_400_BAD_REQUEST)
    
    
    match.status = Match.Status.OPEN
    match.save()
    
    return Response({'message': 'Payment confirmed successfully, match is now open!'}, status=status.HTTP_200_OK)
# 12: Cancel expired unpaid participations
def cancel_expired_unpaid_participations_internal():
    from datetime import timedelta
    expiration_limit = timezone.now() - timedelta(minutes=5)
    
    expired_participations = Participation.objects.filter(
        payment_status=Participation.PaymentStatus.PENDING,
        status=Participation.Status.JOINED,
        joined_at__lt=expiration_limit
    )
    
    for participation in expired_participations:
        participation.status = 'cancelled_by_timeout' if hasattr(Participation.Status, 'CANCELLED_BY_TIMEOUT') else Participation.Status.LEFT
        participation.save()
        
        match = participation.match
        if match.status == Match.Status.FULL:
            match.status = Match.Status.OPEN
            match.save()


POINTS_FOR_WIN = 3
POINTS_FOR_LOSS = 1  # a small reward for showing up and playing


# Submit Result: the host says who won, the match becomes completed and the winner gets the points
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_result(request, match_id):
    with transaction.atomic():
        # lock the match so the result can't be submitted twice at the same moment
        match = get_object_or_404(Match.objects.select_for_update(), pk=match_id)

        if match.creator != request.user:
            return Response({'error': 'Only the host can submit the result.'}, status=status.HTTP_403_FORBIDDEN)
        if match.status == Match.Status.CANCELLED:
            return Response({'error': 'This match was cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        if match.status == Match.Status.COMPLETED:
            return Response({'error': 'The result was already submitted.'}, status=status.HTTP_400_BAD_REQUEST)
        if not match.opponent_id:
            return Response({'error': 'This match has no opponent.'}, status=status.HTTP_400_BAD_REQUEST)
        if match.date > date.today():
            return Response({'error': 'The match has not been played yet.'}, status=status.HTTP_400_BAD_REQUEST)

        # the winner has to be one of the two sides
        winner_id = str(request.data.get('winner_id', ''))
        if winner_id not in (str(match.creator_id), str(match.opponent_id)):
            return Response({'error': 'The winner must be the host or the opponent.'},
                            status=status.HTTP_400_BAD_REQUEST)

        match.winner_id = int(winner_id)
        match.status = Match.Status.COMPLETED
        match.save(update_fields=['winner', 'status'])

    return Response({
        **MatchSerializer(match).data,
        'points_added': {'winner': POINTS_FOR_WIN, 'loser': POINTS_FOR_LOSS},
    }, status=status.HTTP_200_OK)


# Opponents Leaderboard: the people I played against (and me), with their wins and points
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def opponents_leaderboard(request):
    completed = Match.objects.filter(status=Match.Status.COMPLETED)

    # everyone I played against, as host or as opponent
    my_matches = completed.filter(Q(creator=request.user) | Q(opponent=request.user))
    people_ids = {request.user.id}
    for match in my_matches:
        people_ids.add(match.opponent_id if match.creator_id == request.user.id else match.creator_id)

    rows = []
    for person in get_user_model().objects.filter(id__in=people_ids):
        played = completed.filter(Q(creator=person) | Q(opponent=person)).count()
        wins = completed.filter(winner=person).count()
        losses = played - wins
        rows.append({
            'user_id': person.id,
            'name': person.first_name,
            'is_me': person.id == request.user.id,
            'played': played,
            'wins': wins,
            'losses': losses,
            'points': wins * POINTS_FOR_WIN + losses * POINTS_FOR_LOSS,
        })

    # ?sort=wins sorts by wins, anything else sorts by points
    sort_by = 'wins' if request.query_params.get('sort') == 'wins' else 'points'
    rows.sort(key=lambda row: (row[sort_by], row['wins'] if sort_by == 'points' else row['points']), reverse=True)
    for rank, row in enumerate(rows, start=1):
        row['rank'] = rank
    return Response(rows)
