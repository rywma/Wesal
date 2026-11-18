# Admin side of venue requests: see the pending ones, approve them into Matches, or reject them.
# (Venue owners submit them with Ahaad's VenueRequestCreateAPIView.)
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import Match, Sport, VenueRequest
from .serializers import MatchSerializer, VenueRequestSerializer
from .views import SLOT_TAKEN, slot_is_taken


# Admin dashboard: every venue request still waiting for review, oldest first
@api_view(['GET'])
@permission_classes([IsAdminUser])
def pending_venue_requests(request):
    requests = VenueRequest.objects.filter(status=VenueRequest.Status.PENDING).order_by('created_at')
    return Response(VenueRequestSerializer(requests, many=True).data)


# Approve: copy the request into the Matches table so players can see and join it
@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_venue_request(request, request_id):
    # a match needs a sport and a number of players, which the venue form doesn't ask for,
    # so the admin picks them when approving
    sport = Sport.objects.filter(pk=request.data.get('sport_id')).first()
    if not sport:
        return Response({'error': 'A valid sport_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        max_players = int(request.data.get('max_players'))
    except (TypeError, ValueError):
        max_players = 0
    if max_players < 2:
        return Response({'error': 'max_players must be at least 2.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        # lock the request so two admins can't approve it twice
        venue_request = get_object_or_404(VenueRequest.objects.select_for_update(), pk=request_id)
        if venue_request.status != VenueRequest.Status.PENDING:
            return Response({'error': 'This request was already reviewed.'}, status=status.HTTP_400_BAD_REQUEST)

        # same location text as matches made in the app: "Facility, Area"
        location = f'{venue_request.facility_name}, {venue_request.location}'
        # Double Booking Prevention: lock the sport, then make sure the slot is still free
        Sport.objects.select_for_update().get(pk=sport.pk)
        if slot_is_taken(location, venue_request.date, venue_request.time):
            return Response({'error': SLOT_TAKEN}, status=status.HTTP_400_BAD_REQUEST)

        match = Match.objects.create(
            creator=request.user,
            sport=sport,
            date=venue_request.date,
            time=venue_request.time,
            location=location,
            max_players=max_players,
            total_cost=venue_request.total_cost,
            maps_link=venue_request.google_maps_link,
            contact_number=venue_request.contact_number,
            description=venue_request.description or '',
            # the venue is already booked, so there is no host payment step and players can join right away
            status=Match.Status.OPEN,
        )
        venue_request.status = VenueRequest.Status.APPROVED
        venue_request.save(update_fields=['status'])

    return Response({'venue_request_id': venue_request.id, 'match': MatchSerializer(match).data},
                    status=status.HTTP_201_CREATED)


# Reject: delete the request for good, nothing goes into Matches
@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_venue_request(request, request_id):
    with transaction.atomic():
        venue_request = get_object_or_404(VenueRequest.objects.select_for_update(), pk=request_id)
        if venue_request.status != VenueRequest.Status.PENDING:
            return Response({'error': 'This request was already reviewed.'}, status=status.HTTP_400_BAD_REQUEST)
        venue_request.delete()
    return Response({'message': 'The venue request was rejected and deleted.'}, status=status.HTTP_200_OK)
