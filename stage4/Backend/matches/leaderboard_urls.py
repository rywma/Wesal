from django.urls import path
from . import views

urlpatterns = [
    path('opponents/', views.opponents_leaderboard, name='opponents_leaderboard'),
]
