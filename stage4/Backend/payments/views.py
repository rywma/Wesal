import base64
import json
import uuid
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from matches.models import Participation
from .models import Payment

MOYASAR_PAYMENTS_URL = 'https://api.moyasar.com/v1/payments/'


# asks Moyasar for a payment, returns (data, error_message, status_code)
def fetch_moyasar_payment(payment_id):
    # Moyasar uses Basic Auth: the secret key is the username, the password is empty
    token = base64.b64encode(f'{settings.MOYASAR_SECRET_KEY}:'.encode()).decode()
    # Moyasar's firewall blocks Python's default User-Agent, so we send our own
    headers = {'Authorization': f'Basic {token}', 'User-Agent': 'Wesal/1.0'}
    request = Request(MOYASAR_PAYMENTS_URL + payment_id, headers=headers)
    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read()), None, None
    except HTTPError as error:
        if error.code == 404:
            return None, 'Payment not found on Moyasar.', status.HTTP_400_BAD_REQUEST
        return None, 'Moyasar could not check this payment, try again.', status.HTTP_502_BAD_GATEWAY
    except (URLError, TimeoutError):
        return None, 'Could not reach Moyasar, try again.', status.HTTP_502_BAD_GATEWAY


# 7 Payment Simulation: the player sends the Moyasar payment id, we verify it and mark them as paid
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay(request, match_id):
    if not settings.MOYASAR_SECRET_KEY:
        return Response({'error': 'Payments are not set up.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    # Moyasar payment ids are UUIDs, so anything else is rejected before calling Moyasar
    try:
        # also turns other UUID spellings (uppercase, no dashes) into the normal form
        payment_id = str(uuid.UUID(str(request.data.get('payment_id', ''))))
    except ValueError:
        return Response({'error': 'A valid payment_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    participation = Participation.objects.filter(
        match_id=match_id, user=request.user, status=Participation.Status.JOINED
    ).first()
    if not participation:
        return Response({'error': 'You are not in this match.'}, status=status.HTTP_404_NOT_FOUND)
    if participation.payment_status == Participation.PaymentStatus.PAID:
        return Response({'error': 'You already paid for this match.'}, status=status.HTTP_400_BAD_REQUEST)
    if Payment.objects.filter(moyasar_payment_id=payment_id).exists():
        return Response({'error': 'This payment was already used.'}, status=status.HTTP_400_BAD_REQUEST)

    data, error, error_status = fetch_moyasar_payment(payment_id)
    if error:
        return Response({'error': error}, status=error_status)

    # Moyasar sends the amount in halalas (50 SAR = 5000)
    expected_amount = int(participation.payment_amount * 100)
    is_paid = (
        data.get('status') == 'paid'
        and data.get('amount') == expected_amount
        and data.get('currency') == 'SAR'
    )

    # save the attempt and the player's status together, or neither
    try:
        with transaction.atomic():
            participation = Participation.objects.select_for_update().get(pk=participation.pk)
            if participation.payment_status == Participation.PaymentStatus.PAID:
                return Response({'error': 'You already paid for this match.'}, status=status.HTTP_400_BAD_REQUEST)

            Payment.objects.create(
                participation=participation,
                moyasar_payment_id=payment_id,
                amount=Decimal(data.get('amount') or 0) / 100,
                status=Payment.Status.PAID if is_paid else Payment.Status.FAILED,
            )
            if is_paid:
                participation.payment_status = Participation.PaymentStatus.PAID
                participation.save(update_fields=['payment_status'])
    except IntegrityError:
        # two requests sent the same payment id at the same moment, the second one lands here
        return Response({'error': 'This payment was already used.'}, status=status.HTTP_400_BAD_REQUEST)

    if not is_paid:
        return Response({'error': 'Payment could not be verified.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'match_id': participation.match_id,
        'payment_id': payment_id,
        'amount': str(participation.payment_amount),
        'payment_status': participation.payment_status,
    }, status=status.HTTP_200_OK)
