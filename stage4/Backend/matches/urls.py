from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_match, name='create_match'),
]
