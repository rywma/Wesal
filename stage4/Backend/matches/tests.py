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
