from datetime import date, timedelta

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Invitation, Match, Participation, Sport


class BrowseAndDetailsTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host@test.com', email='host@test.com',
                                             password='pass12345', first_name='Host')
        self.player = User.objects.create_user(username='p@test.com', email='p@test.com',
                                               password='pass12345', first_name='Player')
        self.football = Sport.objects.create(name='Football')
        self.padel = Sport.objects.create(name='Padel')
        tomorrow = date.today() + timedelta(days=1)

        self.match = Match.objects.create(creator=self.host, sport=self.football, date=tomorrow, time='20:00',
                                          location='Al Waha Pitch', max_players=10, total_cost=400)
        Participation.objects.create(user=self.host, match=self.match, payment_amount=40)
        Match.objects.create(creator=self.host, sport=self.padel, date=tomorrow + timedelta(days=1), time='21:00',
                             location='Padel Club', max_players=4, total_cost=200)
        # an old match should not show up in browse
        Match.objects.create(creator=self.host, sport=self.padel, date=date.today() - timedelta(days=1),
                             time='21:00', location='Padel Club', max_players=4, total_cost=200)

    def test_browse_without_login(self):
        response = self.client.get('/matches/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 2)

    def test_filters(self):
        self.assertEqual(self.client.get(f'/matches/?sport={self.padel.id}').data['count'], 1)
        self.assertEqual(self.client.get('/matches/?location=waha').data['count'], 1)
        self.assertEqual(self.client.get(f'/matches/?date={self.match.date}').data['count'], 1)
        self.assertEqual(self.client.get('/matches/?time=20:30').data['count'], 1)

    def test_bad_filters_return_400(self):
        self.assertEqual(self.client.get('/matches/?ordering=abc').status_code, 400)
        self.assertEqual(self.client.get('/matches/?date=tomorrow').status_code, 400)
        self.assertEqual(self.client.get('/matches/?sport=padel').status_code, 400)
        self.assertEqual(self.client.get('/matches/?time=late').status_code, 400)

    def test_create_still_needs_login(self):
        response = self.client.post('/matches/', {}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_match_details(self):
        Participation.objects.create(user=self.player, match=self.match, status=Participation.Status.LEFT)
        response = self.client.get(f'/matches/{self.match.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['creator'], {'id': self.host.id, 'name': 'Host'})
        # the player who left is not in the list
        self.assertEqual([p['name'] for p in response.data['participants']], ['Host'])
        self.assertEqual(self.client.get('/matches/999/').status_code, 404)


class InvitationTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host@test.com', email='host@test.com',
                                             password='pass12345', first_name='Host')
        self.player = User.objects.create_user(username='p@test.com', email='p@test.com',
                                               password='pass12345', first_name='Player')
        self.other = User.objects.create_user(username='o@test.com', email='o@test.com',
                                              password='pass12345', first_name='Other')
        sport = Sport.objects.create(name='Football')
        self.match = Match.objects.create(creator=self.host, sport=sport, date=date.today() + timedelta(days=1),
                                          time='20:00', location='Al Waha Pitch', max_players=2, total_cost=100)
        Participation.objects.create(user=self.host, match=self.match, payment_amount=50)
        self.url = f'/matches/{self.match.id}/invitations/'

    def invite(self, email='p@test.com'):
        self.client.force_authenticate(self.host)
        return self.client.post(self.url, {'email': email}, format='json')

    def test_creator_invites_player(self):
        response = self.invite()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['sender'], 'Host')

    def test_only_creator_can_invite(self):
        self.client.force_authenticate(self.other)
        response = self.client.post(self.url, {'email': 'p@test.com'}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_bad_invites(self):
        self.assertEqual(self.invite('nobody@test.com').status_code, 404)
        self.assertEqual(self.invite('host@test.com').status_code, 400)
        self.invite()
        self.assertEqual(self.invite().status_code, 400)

    def test_player_sees_only_their_invitations(self):
        self.invite()
        self.client.force_authenticate(self.player)
        self.assertEqual(len(self.client.get('/invitations/').data), 1)
        self.client.force_authenticate(self.other)
        self.assertEqual(len(self.client.get('/invitations/').data), 0)

    def test_accept_joins_the_match(self):
        invitation_id = self.invite().data['id']
        self.client.force_authenticate(self.player)
        response = self.client.post(f'/invitations/{invitation_id}/accept/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'accepted')
        self.match.refresh_from_db()
        self.assertEqual(self.match.players_count(), 2)
        self.assertEqual(self.match.status, Match.Status.FULL)
        # can't answer twice
        self.assertEqual(self.client.post(f'/invitations/{invitation_id}/accept/').status_code, 400)

    def test_accept_fails_when_match_is_full(self):
        invitation_id = self.invite().data['id']
        self.client.force_authenticate(self.other)
        self.client.post(f'/matches/{self.match.id}/join/')
        self.client.force_authenticate(self.player)
        self.assertEqual(self.client.post(f'/invitations/{invitation_id}/accept/').status_code, 400)
        self.assertEqual(Invitation.objects.get(pk=invitation_id).status, 'pending')

    def test_decline(self):
        invitation_id = self.invite().data['id']
        # someone else can't answer it
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.post(f'/invitations/{invitation_id}/decline/').status_code, 404)
        self.client.force_authenticate(self.player)
        response = self.client.post(f'/invitations/{invitation_id}/decline/')
        self.assertEqual(response.data['status'], 'declined')
        self.assertEqual(self.match.players_count(), 1)


class DoubleBookingTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host@test.com', email='host@test.com',
                                             password='pass12345', first_name='Host')
        self.other = User.objects.create_user(username='o@test.com', email='o@test.com',
                                              password='pass12345', first_name='Other')
        self.football = Sport.objects.create(name='Football')
        self.day = (date.today() + timedelta(days=1)).isoformat()
        self.client.force_authenticate(self.host)
        self.first = self.book(time='16:00')

    def book(self, time='16:00', location='Tennis Court, Al Malqa'):
        return self.client.post('/matches/', {'sport_id': self.football.id, 'date': self.day, 'time': time,
                                              'location': location, 'max_players': 4, 'total_cost': 200},
                                format='json')

    def test_first_booking_works(self):
        self.assertEqual(self.first.status_code, 201)

    def test_same_venue_date_and_time_is_blocked(self):
        self.client.force_authenticate(self.other)
        response = self.book(time='16:00')
        self.assertEqual(response.status_code, 400)
        self.assertIn('already booked', response.data['error'])
        self.assertEqual(Match.objects.count(), 1)

    def test_different_time_or_venue_is_fine(self):
        self.assertEqual(self.book(time='18:00').status_code, 201)
        self.assertEqual(self.book(location='Padel Club').status_code, 201)

    def test_cancelled_slot_can_be_booked_again(self):
        Match.objects.filter(pk=self.first.data['id']).update(status=Match.Status.CANCELLED)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.book(time='16:00').status_code, 201)

    def test_edit_into_a_taken_slot_is_blocked(self):
        second = self.book(time='18:00')
        response = self.client.patch(f"/matches/matches/{second.data['id']}/edit/", {'time': '16:00'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_edit_own_match_keeps_its_slot(self):
        response = self.client.patch(f"/matches/matches/{self.first.data['id']}/edit/", {'total_cost': 300},
                                     format='json')
        self.assertEqual(response.status_code, 200)


class OpponentAndResultTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host@test.com', email='host@test.com',
                                             password='pass12345', first_name='Host')
        self.rival = User.objects.create_user(username='r@test.com', email='r@test.com',
                                              password='pass12345', first_name='Rival')
        self.other = User.objects.create_user(username='o@test.com', email='o@test.com',
                                              password='pass12345', first_name='Other')
        self.tennis = Sport.objects.create(name='Tennis')
        self.client.force_authenticate(self.host)

    def create(self, opponent_id=None, days=1, time='16:00'):
        body = {'sport_id': self.tennis.id, 'date': (date.today() + timedelta(days=days)).isoformat(),
                'time': time, 'location': 'Tennis Court', 'max_players': 2, 'total_cost': 100}
        if opponent_id:
            body['opponent_id'] = opponent_id
        return self.client.post('/matches/', body, format='json')

    def played_match(self, host, opponent, time='16:00'):
        # a match from yesterday, ready for a result
        match = Match.objects.create(creator=host, opponent=opponent, sport=self.tennis,
                                     date=date.today() - timedelta(days=1), time=time,
                                     location='Tennis Court', max_players=2, total_cost=100)
        return match

    def test_create_with_opponent(self):
        response = self.create(opponent_id=self.rival.id)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['opponent'], {'id': self.rival.id, 'name': 'Rival'})
        # the opponent is a player in the match and shows in their my matches
        self.assertEqual(response.data['players_count'], 2)
        self.client.force_authenticate(self.rival)
        mine = self.client.get('/matches/matches/my/').data
        self.assertEqual(mine[0]['opponent']['name'], 'Rival')

    def test_cannot_be_own_opponent(self):
        self.assertEqual(self.create(opponent_id=self.host.id).status_code, 400)
        self.assertFalse(Match.objects.exists())

    def test_host_submits_result(self):
        match = self.played_match(self.host, self.rival)
        response = self.client.post(f'/matches/{match.id}/result/', {'winner_id': self.rival.id}, format='json')
        self.assertEqual(response.status_code, 200)
        match.refresh_from_db()
        self.assertEqual(match.winner, self.rival)
        self.assertEqual(match.status, Match.Status.COMPLETED)

    def test_only_host_submits_result(self):
        match = self.played_match(self.host, self.rival)
        self.client.force_authenticate(self.rival)
        response = self.client.post(f'/matches/{match.id}/result/', {'winner_id': self.rival.id}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_bad_results(self):
        match = self.played_match(self.host, self.rival)
        url = f'/matches/{match.id}/result/'
        # the winner must be one of the two sides
        self.assertEqual(self.client.post(url, {'winner_id': self.other.id}, format='json').status_code, 400)
        self.assertEqual(self.client.post(url, {'winner_id': self.host.id}, format='json').status_code, 200)
        # can't submit twice
        self.assertEqual(self.client.post(url, {'winner_id': self.rival.id}, format='json').status_code, 400)

    def test_future_match_has_no_result_yet(self):
        match_id = self.create(opponent_id=self.rival.id).data['id']
        response = self.client.post(f'/matches/{match_id}/result/', {'winner_id': self.host.id}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_opponents_leaderboard(self):
        stranger = User.objects.create_user(username='x@test.com', email='x@test.com', password='pass12345')
        for i, (host, opponent, winner) in enumerate([(self.host, self.rival, self.rival),
                                                      (self.host, self.rival, self.rival),
                                                      (self.other, self.host, self.host),
                                                      (self.other, stranger, stranger)]):
            match = self.played_match(host, opponent, time=f'1{i}:00')
            match.winner, match.status = winner, Match.Status.COMPLETED
            match.save()

        rows = self.client.get('/leaderboard/opponents/').data
        names = [row['name'] for row in rows]
        # I played Rival and Other, never the stranger
        self.assertEqual(names, ['Rival', 'Host', 'Other'])
        self.assertEqual(rows[0]['wins'], 2)
        self.assertEqual(rows[0]['points'], 6)
        self.assertTrue(rows[1]['is_me'])
        self.assertEqual(self.client.get('/leaderboard/opponents/?sort=wins').data[0]['name'], 'Rival')
