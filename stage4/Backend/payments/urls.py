from django.urls import path

from . import views

urlpatterns = [
    path('<int:match_id>/pay/', views.pay, name='pay'),
]
