from django.urls import path
from . import views

urlpatterns = [
    path('', views.match_list, name='match_list'),
    path('<int:match_id>/', views.get_match_detail, name='match_detail'),
    path('<int:match_id>/join/', views.join_match, name='join_match'),
    path('<int:match_id>/leave/', views.leave_match, name='leave_match'),
    path('<int:match_id>/payments/', views.match_payments, name='match_payments'),
    path('<int:match_id>/my-payment/', views.my_payment, name='my_payment'),
    path('<int:match_id>/invitations/', views.invite_player, name='invite_player'),
    path('<int:match_id>/result/', views.submit_result, name='submit_result'),
    path('matches/my/', views.my_matches, name='my_matches'),
    path('matches/<int:match_id>/edit/', views.edit_match, name='edit_match'),
    path('matches/<int:match_id>/cancel/', views.cancel_match, name='cancel_match'),
    path('matches/<int:match_id>/confirm-payment/', views.confirm_payment, name='confirm_payment'),
    path('leaderboard/', views.opponents_leaderboard, name='opponents_leaderboard'),
]
