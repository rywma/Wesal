from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Participation
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
