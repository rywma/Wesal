from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Match, Participation
from .serializers import MatchSerializer


# 5 Create a Match
@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
