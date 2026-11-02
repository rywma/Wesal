from datetime import date
from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Match, Participation
from .serializers import MatchDetailSerializer, MatchSerializer, PaymentStatusSerializer


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


# 4 Join a Match
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_match(request, match_id):
    with transaction.atomic():
        # select_for_update locks this match row until the transaction ends,
        # so two players can't take the last spot at the same time
        match = get_object_or_404(Match.objects.select_for_update(), pk=match_id)

        if match.status not in (Match.Status.OPEN, Match.Status.FULL):
            return Response({'error': 'This match is not open.'}, status=status.HTTP_400_BAD_REQUEST)

        participation = Participation.objects.filter(user=request.user, match=match).first()
        if participation and participation.status == Participation.Status.JOINED:
            return Response({'error': 'You already joined this match.'}, status=status.HTTP_400_BAD_REQUEST)

        if match.status == Match.Status.FULL or match.spots_left() <= 0:
            return Response({'error': 'This match is full.'}, status=status.HTTP_400_BAD_REQUEST)

        if participation:
            # the player left before and is joining again
            participation.status = Participation.Status.JOINED
            participation.payment_amount = match.share_per_player()
            participation.payment_status = Participation.PaymentStatus.PENDING
            participation.save()
        else:
            participation = Participation.objects.create(
                user=request.user, match=match, payment_amount=match.share_per_player()
            )

        if match.spots_left() == 0:
            match.status = Match.Status.FULL
            match.save()

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