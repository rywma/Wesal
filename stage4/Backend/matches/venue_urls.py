from django.urls import path
from . import venue_views

urlpatterns = [
    path('pending/', venue_views.pending_venue_requests, name='pending_venue_requests'),
    path('<int:request_id>/approve/', venue_views.approve_venue_request, name='approve_venue_request'),
    path('<int:request_id>/reject/', venue_views.reject_venue_request, name='reject_venue_request'),
]
