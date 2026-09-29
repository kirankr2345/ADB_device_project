from django.shortcuts import render
from django.contrib.auth.models import User 
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
@csrf_exempt
def ping(request):
    return Response({'status': 'ok', 'message': 'Django backend server is running'})

@api_view(['POST'])
@csrf_exempt
def register_user(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'User registered successfully', 'user_id': user.id})

@api_view(["POST"])
@csrf_exempt
def login_user(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            'message': 'User logged in successfully',
            'user': {
                'id': user.id,
                'username': user.username
            }
        })

    return Response({'error': 'Incorrect username or password'}, status=401)

@api_view(['POST'])
@csrf_exempt
def logout_user(request):
    logout(request)
    return Response({'message': 'User logged out successfully'})

