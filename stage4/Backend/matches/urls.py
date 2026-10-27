from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_match, name='create_match'),
    path('<int:match_id>/join/', views.join_match, name='join_match'),
    path('<int:match_id>/leave/', views.leave_match, name='leave_match'),
    path('<int:match_id>/payments/', views.match_payments, name='match_payments'),
    path('<int:match_id>/payments/<int:user_id>/', views.update_payment, name='update_payment'),
    path('<int:match_id>/my-payment/', views.my_payment, name='my_payment'),
]
