from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout, name='logout'),
    path('profile/me/', views.get_my_profile, name='my_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('points/', views.add_points, name='add_points'),
   
]
