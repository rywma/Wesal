from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_match, name='create_match'),
    path('<int:match_id>/join/', views.join_match, name='join_match'),
    path('<int:match_id>/leave/', views.leave_match, name='leave_match'),
]
