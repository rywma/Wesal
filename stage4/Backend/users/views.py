from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.http import JsonResponse
import json

@csrf_exempt
def login(request):
    if request.method == 'POST':

        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
       
        user = authenticate(request, username=email, password=password)

        if user is not None:
            return JsonResponse({'status': 'success', 'message': 'Login successful!'}, status=200)
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid email or password'}, status=400)
