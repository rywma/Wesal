# Final Integration Testing
# These tests go through the app the same way the frontend does: they log in with real JWT tokens,
# call the same URLs with the same request bodies as the files in Frontend/src/services, and check
# the fields the pages read. Moyasar is the only part that is faked, because it is an outside service.
import uuid
from datetime import date, timedelta
from unittest import mock

from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from challenges.models import Challenge
from matches.models import Match, Participation, Sport

PASSWORD = 'Test-pass-12345'
DAY = (date.today() + timedelta(days=5)).isoformat()


def moyasar_paid(amount_sar):
    # what Moyasar sends back for a paid payment (the amount is in halalas)
    return {'status': 'paid', 'amount': int(amount_sar * 100), 'currency': 'SAR'}, None, None


@override_settings(MOYASAR_SECRET_KEY='sk_test_fake')
class IntegrationTestCase(APITestCase):
    def setUp(self):
        self.football = Sport.objects.create(name='Football')

    # --- helpers that do what the frontend does ---

    def sign_up(self, name, email):
        # signup.jsx: register, then log in to get the tokens
        response = self.client.post('/users/register/', {'name': name, 'email': email, 'password': PASSWORD},
                                    format='json')
        self.assertEqual(response.status_code, 201, response.content)
        return self.log_in(email)

    def log_in(self, email):
        response = self.client.post('/users/login/', {'email': email, 'password': PASSWORD}, format='json')
        self.assertEqual(response.status_code, 200, response.content)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        return {'token': data['tokens']['access'], 'id': data['user']['id'], 'name': data['user']['name']}

    def as_user(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {user['token']}")

    def create_match(self, host, time='18:00', max_players=4, total_cost=200, opponent=None):
        # CreateMatch.jsx sends the sport id, "Venue, Area", the format's players and the venue price
        self.as_user(host)
        body = {'sport_id': self.football.id, 'date': DAY, 'time': time, 'location': 'Al Waha Pitch, Al Malqa',
                'max_players': max_players, 'total_cost': total_cost}
        if opponent:
            body['opponent_id'] = opponent['id']
        return self.client.post('/matches/', body, format='json')

    def pay(self, user, match_id, amount):
        # PayShare.jsx: after Moyasar sends the player back, the backend checks the payment id with Moyasar
        self.as_user(user)
        with mock.patch('payments.views.fetch_moyasar_payment', return_value=moyasar_paid(amount)):
            return self.client.post(f'/payments/{match_id}/pay/', {'payment_id': str(uuid.uuid4())}, format='json')

    def host_pays_and_confirms(self, host, match_id, amount):
        # HostPayment.jsx: pay the share, then confirm the match
        self.assertEqual(self.pay(host, match_id, amount).status_code, 200)
        self.as_user(host)
        return self.client.post(f'/matches/{match_id}/confirm-payment/')

    def browse_ids(self):
        # BrowseMatches.jsx reads data.results
        self.client.credentials()
        return [m['id'] for m in self.client.get('/matches/', {'page': 1}).json()['results']]

    def detail(self, match_id):
        self.client.credentials()
        return self.client.get(f'/matches/{match_id}/').json()


class MatchJourneyTests(IntegrationTestCase):
    def test_full_journey_from_sign_up_to_payment(self):
        host = self.sign_up('Sara', 'sara@test.com')
        player = self.sign_up('Nora', 'nora@test.com')

        # Profile setup page loads the profile with the same token
        self.as_user(host)
        self.assertEqual(self.client.get('/users/profile/me/').status_code, 200)

        # the host creates a match and is sent to the host payment page
        response = self.create_match(host, max_players=2, total_cost=100)
        self.assertEqual(response.status_code, 201, response.content)
        match_id = response.json()['id']
        self.assertEqual(response.json()['status'], 'pending_payment')
        self.assertIsNotNone(response.json()['host_payment_expires_at'])
        # not paid yet, so nobody can find it
        self.assertNotIn(match_id, self.browse_ids())

        # the host pays 50 SAR and confirms, now the match is open and can be found
        self.assertEqual(self.host_pays_and_confirms(host, match_id, 50).status_code, 200)
        self.assertEqual(self.detail(match_id)['status'], 'open')
        self.assertIn(match_id, self.browse_ids())

        # the player joins from the match page; payment only opens once the match is full
        self.as_user(player)
        response = self.client.post(f'/matches/{match_id}/join/')
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['my_share'], '50.00')

        match = self.detail(match_id)
        self.assertEqual(match['status'], 'full')
        self.assertIsNotNone(match['payment_expires_at'])  # PayShare.jsx shows this deadline
        self.assertEqual({p['name'] for p in match['participants']}, {'Sara', 'Nora'})

        # the player pays, and the host sees both players paid
        self.assertEqual(self.pay(player, match_id, 50).status_code, 200)
        self.as_user(player)
        self.assertEqual(self.client.get(f'/matches/{match_id}/my-payment/').json()['payment_status'], 'paid')
        self.as_user(host)
        payments = self.client.get(f'/matches/{match_id}/payments/').json()
        statuses = [p['payment_status'] for p in (payments['players'] if 'players' in payments else payments)]
        self.assertEqual(statuses, ['paid', 'paid'])

        # both see it in My Matches
        for user in (host, player):
            self.as_user(user)
            self.assertIn(match_id, [m['id'] for m in self.client.get('/matches/matches/my/').json()])

    def test_host_must_pay_before_the_match_opens(self):
        # bug fixed: confirm-payment used to open the match even when the host had not paid
        host = self.sign_up('Sara', 'sara@test.com')
        match_id = self.create_match(host).json()['id']

        self.as_user(host)
        response = self.client.post(f'/matches/{match_id}/confirm-payment/')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.detail(match_id)['status'], 'pending_payment')
        self.assertNotIn(match_id, self.browse_ids())

        # after paying it works, and confirming again (page refresh) is still fine
        self.assertEqual(self.host_pays_and_confirms(host, match_id, 50).status_code, 200)
        self.as_user(host)
        self.assertEqual(self.client.post(f'/matches/{match_id}/confirm-payment/').status_code, 200)
        self.assertEqual(self.detail(match_id)['status'], 'open')

    def test_only_the_host_can_confirm(self):
        host = self.sign_up('Sara', 'sara@test.com')
        other = self.sign_up('Lama', 'lama@test.com')
        match_id = self.create_match(host).json()['id']
        self.as_user(other)
        self.assertEqual(self.client.post(f'/matches/{match_id}/confirm-payment/').status_code, 403)

    def test_unpaid_reservation_expires_and_frees_the_slot(self):
        # bug fixed: an unpaid reservation stayed "pending_payment" forever and blocked the venue slot
        host = self.sign_up('Sara', 'sara@test.com')
        other = self.sign_up('Lama', 'lama@test.com')
        match_id = self.create_match(host).json()['id']

        # while the 5 minutes are running, the slot is taken
        self.assertEqual(self.create_match(other).status_code, 400)

        Match.objects.filter(pk=match_id).update(host_payment_expires_at=timezone.now() - timedelta(minutes=1))

        # HostPayment.jsx shows "Reservation cancelled" when the status is cancelled
        self.assertEqual(self.detail(match_id)['status'], 'cancelled')
        self.assertEqual(self.create_match(other).status_code, 201)

    def test_paid_reservation_is_not_cancelled_when_time_runs_out(self):
        # a host who paid but closed the page before confirming keeps the match
        host = self.sign_up('Sara', 'sara@test.com')
        match_id = self.create_match(host).json()['id']
        self.assertEqual(self.pay(host, match_id, 50).status_code, 200)
        Match.objects.filter(pk=match_id).update(host_payment_expires_at=timezone.now() - timedelta(minutes=1))

        self.assertEqual(self.detail(match_id)['status'], 'pending_payment')
        self.as_user(host)
        self.assertEqual(self.client.post(f'/matches/{match_id}/confirm-payment/').status_code, 200)
        self.assertEqual(self.detail(match_id)['status'], 'open')


class PaymentWindowTests(IntegrationTestCase):
    def setUp(self):
        super().setUp()
        self.host = self.sign_up('Sara', 'sara@test.com')
        self.player = self.sign_up('Nora', 'nora@test.com')
        self.late = self.sign_up('Reem', 'reem@test.com')
        self.match_id = self.create_match(self.host, max_players=3, total_cost=150).json()['id']
        self.host_pays_and_confirms(self.host, self.match_id, 50)

    def join(self, user):
        self.as_user(user)
        return self.client.post(f'/matches/{self.match_id}/join/')

    def test_player_waiting_for_the_match_to_fill_keeps_their_spot(self):
        # bug fixed: players were removed 5 minutes after joining, but they can only pay once the
        # match is full, so a bigger match could never fill up
        self.assertEqual(self.join(self.player).status_code, 200)
        Participation.objects.filter(user_id=self.player['id']).update(joined_at=timezone.now() - timedelta(hours=1))

        self.assertEqual(self.join(self.late).status_code, 200)
        match = self.detail(self.match_id)
        self.assertEqual(match['players_count'], 3)
        self.assertEqual(match['status'], 'full')

    def test_unpaid_players_lose_their_spot_after_the_payment_window(self):
        self.join(self.player)
        self.join(self.late)
        self.assertEqual(self.pay(self.player, self.match_id, 50).status_code, 200)

        Match.objects.filter(pk=self.match_id).update(payment_expires_at=timezone.now() - timedelta(minutes=1))

        match = self.detail(self.match_id)
        self.assertEqual(match['status'], 'open')
        self.assertIsNone(match['payment_expires_at'])
        self.assertEqual({p['name'] for p in match['participants']}, {'Sara', 'Nora'})

    def test_leaving_a_full_match_closes_the_payment_window(self):
        self.join(self.player)
        self.join(self.late)
        self.as_user(self.late)
        self.assertEqual(self.client.post(f'/matches/{self.match_id}/leave/').status_code, 200)

        match = self.detail(self.match_id)
        self.assertEqual(match['status'], 'open')
        self.assertIsNone(match['payment_expires_at'])


class OpponentResultTests(IntegrationTestCase):
    def test_match_with_an_opponent_to_result_leaderboard_and_challenge(self):
        host = self.sign_up('Sara', 'sara@test.com')
        rival = self.sign_up('Nora', 'nora@test.com')

        # bug fixed: picking an opponent always failed with "This match is not open"
        response = self.create_match(host, max_players=2, total_cost=100, opponent=rival)
        self.assertEqual(response.status_code, 201, response.content)
        match_id = response.json()['id']
        self.assertEqual(response.json()['opponent']['id'], rival['id'])
        self.assertEqual(response.json()['status'], 'pending_payment')

        # the opponent took the last spot, so after the host pays the match is full and payment opens
        self.assertEqual(self.host_pays_and_confirms(host, match_id, 50).status_code, 200)
        match = self.detail(match_id)
        self.assertEqual(match['status'], 'full')
        self.assertIsNotNone(match['payment_expires_at'])
        self.assertEqual(self.pay(rival, match_id, 50).status_code, 200)

        # the match is played, the host submits the result
        Match.objects.filter(pk=match_id).update(date=date.today() - timedelta(days=1))
        self.as_user(host)
        response = self.client.post(f'/matches/{match_id}/result/', {'winner_id': host['id']}, format='json')
        self.assertEqual(response.status_code, 200, response.content)

        # the leaderboard and a "win 1 match" challenge both see the win
        # (the leaderboard shows the people I played against, so it needs a login)
        self.as_user(rival)
        board = self.client.get('/leaderboard/opponents/').json()
        self.assertEqual((board[0]['name'], board[0]['wins'], board[0]['rank']), ('Sara', 1, 1))

        challenge = Challenge.objects.create(
            title='First win', goal_type=Challenge.GoalType.WIN, target=1, sport=self.football,
            start_date=date.today() - timedelta(days=7), end_date=date.today() + timedelta(days=7),
            badge_name='Winner')
        self.as_user(host)
        self.assertEqual(self.client.post(f'/challenges/{challenge.id}/join/').status_code, 201)
        mine = self.client.get(f'/challenges/{challenge.id}/').json()
        self.assertEqual((mine['progress'], mine['completed']), (1, True))
        # MyMatches.jsx shows badge_name and uses challenge_id as the key
        badges = self.client.get('/challenges/my-badges/').json()
        self.assertEqual([(b['challenge_id'], b['badge_name']) for b in badges], [(challenge.id, 'Winner')])


class InvitationTests(IntegrationTestCase):
    def test_invite_accept_and_join(self):
        host = self.sign_up('Sara', 'sara@test.com')
        friend = self.sign_up('Nora', 'nora@test.com')
        match_id = self.create_match(host).json()['id']

        # invites only work once the match is open
        self.as_user(host)
        self.assertEqual(self.client.post(f'/matches/{match_id}/invitations/', {'email': 'nora@test.com'},
                                          format='json').status_code, 400)
        self.host_pays_and_confirms(host, match_id, 50)
        self.as_user(host)
        response = self.client.post(f'/matches/{match_id}/invitations/', {'email': 'nora@test.com'}, format='json')
        self.assertIn(response.status_code, (200, 201), response.content)

        # Invitations.jsx lists them and accepts
        self.as_user(friend)
        invitations = self.client.get('/invitations/').json()
        self.assertEqual(len(invitations), 1)
        response = self.client.post(f"/invitations/{invitations[0]['id']}/accept/")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertIn('Nora', {p['name'] for p in self.detail(match_id)['participants']})


class AuthTests(IntegrationTestCase):
    def test_protected_pages_need_a_valid_token(self):
        # the frontend shows "session expired" when the backend answers with token_not_valid
        self.client.credentials(HTTP_AUTHORIZATION='Bearer not-a-real-token')
        response = self.client.get('/matches/matches/my/')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()['code'], 'token_not_valid')

    def test_browsing_works_without_logging_in(self):
        host = self.sign_up('Sara', 'sara@test.com')
        match_id = self.create_match(host).json()['id']
        self.host_pays_and_confirms(host, match_id, 50)
        self.assertIn(match_id, self.browse_ids())
        self.assertEqual(self.detail(match_id)['id'], match_id)

    def test_log_out(self):
        self.client.post('/users/register/', {'name': 'Sara', 'email': 'sara@test.com', 'password': PASSWORD},
                         format='json')
        login = self.client.post('/users/login/', {'email': 'sara@test.com', 'password': PASSWORD},
                                 format='json').json()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login['tokens']['access']}")
        response = self.client.post('/users/logout/', {'refresh': login['tokens']['refresh']}, format='json')
        self.assertEqual(response.json()['status'], 'success')
