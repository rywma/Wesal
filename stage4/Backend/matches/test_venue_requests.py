from datetime import date, timedelta

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from matches.models import Match, Sport, VenueRequest

DAY = date.today() + timedelta(days=3)


class VenueRequestAdminTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin@test.com', email='admin@test.com',
                                              password='pass12345', first_name='Admin', is_staff=True)
        self.owner = User.objects.create_user(username='owner@test.com', email='owner@test.com',
                                              password='pass12345', first_name='Owner')
        self.tennis = Sport.objects.create(name='Tennis')
        self.submission = self.submit()
        self.client.force_authenticate(self.admin)

    def submit(self, time='16:00', facility='Malqa Tennis Court'):
        return VenueRequest.objects.create(
            facility_name=facility, location='Al Malqa', google_maps_link='https://maps.google.com/?q=malqa',
            date=DAY, time=time, total_cost=200, contact_number='0500000000',
            description='Indoor court')

    def approve(self, submission=None, body=None):
        body = body if body is not None else {'sport_id': self.tennis.id, 'max_players': 4}
        return self.client.post(f'/venue-requests/{(submission or self.submission).id}/approve/', body,
                                format='json')

    def test_admin_sees_pending_requests(self):
        reviewed = self.submit(time='18:00')
        reviewed.status = VenueRequest.Status.APPROVED
        reviewed.save()
        rows = self.client.get('/venue-requests/pending/').data
        self.assertEqual([r['id'] for r in rows], [self.submission.id])
        self.assertEqual(rows[0]['facility_name'], 'Malqa Tennis Court')

    def test_only_admins_can_use_the_dashboard(self):
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get('/venue-requests/pending/').status_code, 403)
        self.assertEqual(self.approve().status_code, 403)
        self.assertEqual(self.client.post(f'/venue-requests/{self.submission.id}/reject/').status_code, 403)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get('/venue-requests/pending/').status_code, 401)

    def test_approve_creates_an_open_match(self):
        response = self.approve()
        self.assertEqual(response.status_code, 201)
        match = Match.objects.get()
        self.assertEqual(match.location, 'Malqa Tennis Court, Al Malqa')
        self.assertEqual((match.date, str(match.time), match.total_cost), (DAY, '16:00:00', 200))
        self.assertEqual((match.maps_link, match.contact_number, match.description),
                         ('https://maps.google.com/?q=malqa', '0500000000', 'Indoor court'))
        self.assertEqual((match.status, match.max_players, match.sport), (Match.Status.OPEN, 4, self.tennis))
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.status, VenueRequest.Status.APPROVED)
        # it leaves the pending list and players can see it
        self.assertEqual(self.client.get('/venue-requests/pending/').data, [])
        self.assertEqual(response.data['match']['maps_link'], 'https://maps.google.com/?q=malqa')

    def test_cannot_approve_twice(self):
        self.approve()
        self.assertEqual(self.approve().status_code, 400)
        self.assertEqual(Match.objects.count(), 1)

    def test_approve_needs_sport_and_players(self):
        self.assertEqual(self.approve(body={'max_players': 4}).status_code, 400)
        self.assertEqual(self.approve(body={'sport_id': self.tennis.id, 'max_players': 1}).status_code, 400)
        self.assertFalse(Match.objects.exists())

    def test_approve_blocks_a_taken_slot(self):
        Match.objects.create(creator=self.owner, sport=self.tennis, date=DAY, time='16:00',
                             location='Malqa Tennis Court, Al Malqa', max_players=4, total_cost=100)
        response = self.approve()
        self.assertEqual(response.status_code, 400)
        self.assertIn('already booked', response.data['error'])
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.status, VenueRequest.Status.PENDING)

    def test_reject_deletes_without_a_match(self):
        response = self.client.post(f'/venue-requests/{self.submission.id}/reject/')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(VenueRequest.objects.exists())
        self.assertFalse(Match.objects.exists())

    def test_cannot_reject_an_approved_request(self):
        self.approve()
        self.assertEqual(self.client.post(f'/venue-requests/{self.submission.id}/reject/').status_code, 400)

    def test_unknown_request(self):
        self.assertEqual(self.client.post('/venue-requests/999/reject/').status_code, 404)
