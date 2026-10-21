from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
import json

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST is allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    email = (data.get('email') or '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return JsonResponse({'status': 'error', 'message': 'Email and password are required'}, status=400)

    user = authenticate(request, username=email, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)

        return JsonResponse({
            'status': 'success', 
            'message': 'Login successful!',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': {
                'id': user.id,
                'name': user.first_name,
                'email': user.email
            }
        }, status=200)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid email or password'}, status=400)

@csrf_exempt
def register(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST is allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    name = data.get('name', '')
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return JsonResponse({'status': 'error', 'message': 'Email and password are required'}, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({'status': 'error', 'message': 'Email is already registered'}, status=400)

    try:
        validate_password(password)
    except ValidationError as e:
        return JsonResponse({'status': 'error', 'message': e.messages}, status=400)

    # email is stored as the username so login can authenticate with it
    # create_user hashes the password before saving it
    user = User.objects.create_user(username=email, email=email, password=password, first_name=name)

    return JsonResponse({
        'status': 'success',
        'message': 'Account created!',
        'user': {'id': user.id, 'name': user.first_name, 'email': user.email},
    }, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh = request.data.get('refresh')
    if not refresh:
        return Response({'status': 'error', 'message': 'Refresh token is required'}, status=400)

    try:
        RefreshToken(refresh).blacklist()
    except TokenError:
        return Response({'status': 'error', 'message': 'Invalid or expired token'}, status=400)

    return Response({'status': 'success', 'message': 'Logged out'}, status=200)
