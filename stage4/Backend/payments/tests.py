from datetime import date, timedelta
from unittest import mock

from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.test import APITestCase

from matches.models import Match, Participation, Sport
from .models import Payment

PAYMENT_ID = '0b6d6e4f-2a1c-4c5e-9f3a-1d2b3c4d5e6f'


@override_settings(MOYASAR_SECRET_KEY='sk_test_fake')
class PayTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host@test.com', email='host@test.com',
                                             password='pass12345', first_name='Host')
        self.player = User.objects.create_user(username='p@test.com', email='p@test.com',
                                               password='pass12345', first_name='Player')
        football = Sport.objects.create(name='Football')
        self.match = Match.objects.create(creator=self.host, sport=football,
                                          date=date.today() + timedelta(days=1), time='20:00',
                                          location='Al Waha Pitch', max_players=4, total_cost=200)
        # 200 SAR / 4 players = 50 SAR each = 5000 halalas on Moyasar
        self.participation = Participation.objects.create(user=self.player, match=self.match, payment_amount=50)
        self.url = f'/payments/{self.match.id}/pay/'

    def pay(self, moyasar_data, payment_id=PAYMENT_ID):
        with mock.patch('payments.views.fetch_moyasar_payment', return_value=(moyasar_data, None, None)):
            return self.client.post(self.url, {'payment_id': payment_id}, format='json')

    def test_pay_success_marks_player_paid(self):
        self.client.force_authenticate(self.player)
        response = self.pay({'status': 'paid', 'amount': 5000, 'currency': 'SAR'})
        self.assertEqual(response.status_code, 200)
        self.participation.refresh_from_db()
        self.assertEqual(self.participation.payment_status, Participation.PaymentStatus.PAID)
        self.assertEqual(Payment.objects.get().status, Payment.Status.PAID)

    def test_wrong_amount_is_rejected(self):
        self.client.force_authenticate(self.player)
        response = self.pay({'status': 'paid', 'amount': 100, 'currency': 'SAR'})
        self.assertEqual(response.status_code, 400)
        self.participation.refresh_from_db()
        self.assertEqual(self.participation.payment_status, Participation.PaymentStatus.PENDING)
        self.assertEqual(Payment.objects.get().status, Payment.Status.FAILED)

    def test_failed_payment_is_rejected(self):
        self.client.force_authenticate(self.player)
        response = self.pay({'status': 'failed', 'amount': 5000, 'currency': 'SAR'})
        self.assertEqual(response.status_code, 400)
        self.participation.refresh_from_db()
        self.assertEqual(self.participation.payment_status, Participation.PaymentStatus.PENDING)

    def test_cannot_pay_twice(self):
        self.client.force_authenticate(self.player)
        self.pay({'status': 'paid', 'amount': 5000, 'currency': 'SAR'})
        response = self.pay({'status': 'paid', 'amount': 5000, 'currency': 'SAR'},
                            payment_id='1c7e7f50-3b2d-4d6f-8a4b-2e3c4d5e6f70')
        self.assertEqual(response.status_code, 400)

    def test_same_payment_id_cannot_be_reused(self):
        other = User.objects.create_user(username='o@test.com', email='o@test.com', password='pass12345')
        Participation.objects.create(user=other, match=self.match, payment_amount=50)
        self.client.force_authenticate(self.player)
        self.pay({'status': 'paid', 'amount': 5000, 'currency': 'SAR'})

        self.client.force_authenticate(other)
        response = self.pay({'status': 'paid', 'amount': 5000, 'currency': 'SAR'})
        self.assertEqual(response.status_code, 400)

    def test_invalid_payment_id(self):
        self.client.force_authenticate(self.player)
        response = self.client.post(self.url, {'payment_id': 'abc'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_player_not_in_match(self):
        stranger = User.objects.create_user(username='s@test.com', email='s@test.com', password='pass12345')
        self.client.force_authenticate(stranger)
        response = self.pay({'status': 'paid', 'amount': 5000, 'currency': 'SAR'})
        self.assertEqual(response.status_code, 404)

    def test_pay_without_login(self):
        response = self.client.post(self.url, {'payment_id': PAYMENT_ID}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_moyasar_payment_not_found(self):
        self.client.force_authenticate(self.player)
        with mock.patch('payments.views.fetch_moyasar_payment',
                        return_value=(None, 'Payment not found on Moyasar.', 400)):
            response = self.client.post(self.url, {'payment_id': PAYMENT_ID}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Payment.objects.exists())

    def test_uppercase_payment_id_is_saved_in_normal_form(self):
        self.client.force_authenticate(self.player)
        response = self.pay({'status': 'paid', 'amount': 5000, 'currency': 'SAR'}, payment_id=PAYMENT_ID.upper())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Payment.objects.get().moyasar_payment_id, PAYMENT_ID)

    def test_moyasar_timeout(self):
        self.client.force_authenticate(self.player)
        with mock.patch('payments.views.urlopen', side_effect=TimeoutError):
            response = self.client.post(self.url, {'payment_id': PAYMENT_ID}, format='json')
        self.assertEqual(response.status_code, 502)
        self.assertFalse(Payment.objects.exists())
