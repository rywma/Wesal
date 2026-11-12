from django.urls import path
from . import views

urlpatterns = [
    path('', views.challenge_list, name='challenge_list'),
    path('my-badges/', views.my_badges, name='my_badges'),
    path('<int:challenge_id>/', views.challenge_detail, name='challenge_detail'),
    path('<int:challenge_id>/join/', views.join_challenge, name='join_challenge'),
    path('<int:challenge_id>/leave/', views.leave_challenge, name='leave_challenge'),
]
