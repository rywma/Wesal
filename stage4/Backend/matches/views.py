from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date, parse_time
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Invitation, Match, Participation
from .serializers import InvitationSerializer, MatchDetailSerializer, MatchSerializer, PaymentStatusSerializer


# /matches/ : GET browses matches (anyone), POST creates one (logged in only)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def match_list(request):
    if request.method == 'POST':
        return create_match(request)
    return get_matches(request)


# 5 Create a Match
def create_match(request):
    serializer = MatchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # save the match and the creator's spot together, or neither
    with transaction.atomic():
        match = serializer.save(creator=request.user)
        # the creator is the first player in the match
        Participation.objects.create(user=request.user, match=match, payment_amount=match.share_per_player())

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


# 4 Join a Match
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_match(request, match_id):
    with transaction.atomic():
        # select_for_update locks this match row until the transaction ends,
        # so two players can't take the last spot at the same time
        match = get_object_or_404(Match.objects.select_for_update(), pk=match_id)
        participation, error = add_player(match, request.user)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

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


# 7: the creator marks a player as paid or pending
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_payment(request, match_id, user_id):
    match = get_object_or_404(Match, pk=match_id)
    if match.creator != request.user:
        return Response({'error': 'Only the match creator can update payments.'}, status=status.HTTP_403_FORBIDDEN)

    participation = Participation.objects.filter(
        match=match, user_id=user_id, status=Participation.Status.JOINED
    ).first()
    if not participation:
        return Response({'error': 'This player is not in this match.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PaymentStatusSerializer(participation, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    return Response(serializer.data)


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
