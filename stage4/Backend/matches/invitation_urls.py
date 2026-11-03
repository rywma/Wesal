from django.urls import path
from . import views

urlpatterns = [
    path('', views.my_invitations, name='my_invitations'),
    path('<int:invitation_id>/accept/', views.accept_invitation, name='accept_invitation'),
    path('<int:invitation_id>/decline/', views.decline_invitation, name='decline_invitation'),
]
