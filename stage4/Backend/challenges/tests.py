from datetime import date, timedelta

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from matches.models import Match, Participation, Sport
from .models import Challenge, ChallengeEntry

TODAY = date.today()


class ChallengeTests(APITestCase):
    def setUp(self):
        self.sara = User.objects.create_user(username='sara@test.com', email='sara@test.com',
                                             password='pass12345', first_name='Sara')
        self.nora = User.objects.create_user(username='nora@test.com', email='nora@test.com',
                                             password='pass12345', first_name='Nora')
        self.football, _ = Sport.objects.get_or_create(name='Football')
        self.padel, _ = Sport.objects.get_or_create(name='Padel')
        # play 2 football matches in the last/next 10 days
        self.challenge = Challenge.objects.create(
            title='Test Football', goal_type='play', target=2, sport=self.football,
            start_date=TODAY - timedelta(days=10), end_date=TODAY + timedelta(days=10), badge_name='Tester')
        self.client.force_authenticate(self.sara)

    def play(self, user, days_ago=1, sport=None, status=Match.Status.OPEN, winner=None,
             participation_status=Participation.Status.JOINED):
        match = Match.objects.create(creator=user, sport=sport or self.football,
                                     date=TODAY - timedelta(days=days_ago), time=f'{days_ago % 24:02d}:00',
                                     location=f'Pitch {Match.objects.count()}', max_players=10, total_cost=100,
                                     status=status, winner=winner)
        Participation.objects.create(user=user, match=match, payment_amount=10, status=participation_status)
        return match

    def join(self, challenge=None):
        return self.client.post(f'/challenges/{(challenge or self.challenge).id}/join/')

    def mine(self, data):
        return next(c for c in data if c['id'] == self.challenge.id)

    def test_starter_challenges_exist(self):
        # the test database has no sports yet, so only the any-sport starters are added here
        titles = set(Challenge.objects.values_list('title', flat=True))
        self.assertTrue({'First Kickoff', "Winner's Circle"} <= titles)

    def test_list_shows_my_progress(self):
        row = self.mine(self.client.get('/challenges/').data)
        self.assertFalse(row['joined'])
        self.assertIsNone(row['progress'])

        self.play(self.sara)
        self.join()
        row = self.mine(self.client.get('/challenges/').data)
        self.assertEqual((row['joined'], row['progress'], row['percent']), (True, 1, 50))

    def test_join_twice(self):
        self.assertEqual(self.join().status_code, 201)
        self.assertEqual(self.join().status_code, 400)

    def test_ended_challenge_cannot_be_joined(self):
        old = Challenge.objects.create(title='Old', target=1, start_date=TODAY - timedelta(days=30),
                                       end_date=TODAY - timedelta(days=1), badge_name='Old')
        self.assertEqual(self.join(old).status_code, 400)

    def test_only_qualifying_matches_count(self):
        self.play(self.sara)                                       # counts
        self.play(self.sara, days_ago=-2)                          # future match
        self.play(self.sara, days_ago=20)                          # before the challenge started
        self.play(self.sara, sport=self.padel)                     # wrong sport
        self.play(self.sara, status=Match.Status.CANCELLED)        # cancelled
        self.play(self.sara, participation_status=Participation.Status.LEFT)  # left the match
        self.join()
        self.assertEqual(self.client.get(f'/challenges/{self.challenge.id}/').data['progress'], 1)

    def test_reaching_the_target_gives_the_badge(self):
        self.join()
        self.play(self.sara, days_ago=1)
        self.play(self.sara, days_ago=2)
        row = self.client.get(f'/challenges/{self.challenge.id}/').data
        self.assertTrue(row['completed'])
        self.assertEqual(row['percent'], 100)
        badges = self.client.get('/challenges/my-badges/').data
        self.assertEqual([b['badge_name'] for b in badges], ['Tester'])

    def test_win_challenge_counts_only_wins(self):
        wins = Challenge.objects.create(title='Win 1', goal_type='win', target=1,
                                        start_date=TODAY - timedelta(days=10),
                                        end_date=TODAY + timedelta(days=10), badge_name='Winner')
        self.join(wins)
        self.play(self.sara, status=Match.Status.COMPLETED, winner=self.nora)
        self.assertEqual(self.client.get(f'/challenges/{wins.id}/').data['progress'], 0)
        self.play(self.sara, days_ago=2, status=Match.Status.COMPLETED, winner=self.sara)
        self.assertTrue(self.client.get(f'/challenges/{wins.id}/').data['completed'])

    def test_leaderboard_sorted_by_progress(self):
        self.join()
        self.client.force_authenticate(self.nora)
        self.join()
        self.play(self.nora)
        board = self.client.get(f'/challenges/{self.challenge.id}/').data['leaderboard']
        self.assertEqual([(r['name'], r['progress'], r['rank']) for r in board], [('Nora', 1, 1), ('Sara', 0, 2)])
        self.assertTrue(board[0]['is_me'])

    def test_leave(self):
        self.assertEqual(self.client.post(f'/challenges/{self.challenge.id}/leave/').status_code, 400)
        self.join()
        self.assertEqual(self.client.post(f'/challenges/{self.challenge.id}/leave/').status_code, 200)
        self.assertFalse(ChallengeEntry.objects.exists())

    def test_completed_challenge_cannot_be_left(self):
        self.join()
        self.play(self.sara, days_ago=1)
        self.play(self.sara, days_ago=2)
        self.assertEqual(self.client.post(f'/challenges/{self.challenge.id}/leave/').status_code, 400)

    def test_login_required(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get('/challenges/').status_code, 401)
        self.assertEqual(self.client.get('/challenges/my-badges/').status_code, 401)
