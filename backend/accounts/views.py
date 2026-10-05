from django.shortcuts import render
from django.contrib.auth.models import User 
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UserProfile, CandidateProfile, RecruiterProfile, Education, Experience, Resume
from .serializer import (
    UserProfileSerializer, CandidateProfileSerializer, RecruiterProfileSerializer,
    EducationSerializer, ExperienceSerializer, ResumeSerializer, UserSerializer
)

@api_view(['GET'])
@csrf_exempt
def ping(request):
    return Response({'status': 'ok', 'message': 'Django backend server is running'})

@api_view(['POST'])
@csrf_exempt
def register_user(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()
    role = request.data.get('role', 'candidate').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    user_profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': role})
    
    if role == 'candidate':
        CandidateProfile.objects.get_or_create(user=user)
    elif role == 'recruiter':
        # RecruiterProfile requires company, handled on company creation or profile setup
        pass

    return Response({
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user_profile.role
        }
    })

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
        user_profile, _ = UserProfile.objects.get_or_create(user=user)
        candidate_prof = CandidateProfile.objects.filter(user=user).first()
        recruiter_prof = RecruiterProfile.objects.filter(user=user).first()
        
        return Response({
            'message': 'User logged in successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user_profile.role,
                'phone': user_profile.phone,
                'location': user_profile.location,
                'candidate_profile_id': candidate_prof.id if candidate_prof else None,
                'recruiter_profile_id': recruiter_prof.id if recruiter_prof else None,
                'company_id': recruiter_prof.company_id if recruiter_prof else None,
            }
        })

    return Response({'error': 'Incorrect username or password'}, status=401)

@api_view(['POST'])
@csrf_exempt
def logout_user(request):
    logout(request)
    return Response({'message': 'User logged out successfully'})

@api_view(['GET', 'POST', 'PUT'])
@csrf_exempt
def user_profile_detail(request, user_id=None):
    if user_id is None and request.user.is_authenticated:
        target_user = request.user
    elif user_id:
        target_user = User.objects.filter(id=user_id).first()
    else:
        target_user = None

    if not target_user:
        return Response({'error': 'User not found or unauthenticated'}, status=404)

    user_profile, _ = UserProfile.objects.get_or_create(user=target_user)
    candidate_profile, _ = CandidateProfile.objects.get_or_create(user=target_user)

    if request.method in ['POST', 'PUT']:
        role = request.data.get('role', user_profile.role)
        phone = request.data.get('phone', user_profile.phone)
        location = request.data.get('location', user_profile.location)
        
        user_profile.role = role
        user_profile.phone = phone
        user_profile.location = location
        
        if 'profile_image' in request.FILES:
            user_profile.profile_image = request.FILES['profile_image']
            
        user_profile.save()

        # Update candidate profile fields if present
        if 'headline' in request.data: candidate_profile.headline = request.data['headline']
        if 'bio' in request.data: candidate_profile.bio = request.data['bio']
        if 'current_job_title' in request.data: candidate_profile.current_job_title = request.data['current_job_title']
        if 'experience_years' in request.data and request.data['experience_years']:
            candidate_profile.experience_years = request.data['experience_years']
        if 'expected_salary' in request.data and request.data['expected_salary']:
            candidate_profile.expected_salary = request.data['expected_salary']
        if 'preferred_location' in request.data: candidate_profile.preferred_location = request.data['preferred_location']
        if 'linkedin_url' in request.data: candidate_profile.linkedin_url = request.data['linkedin_url']
        if 'github_url' in request.data: candidate_profile.github_url = request.data['github_url']
        if 'portfolio_url' in request.data: candidate_profile.portfolio_url = request.data['portfolio_url']
        candidate_profile.save()

    u_data = UserProfileSerializer(user_profile).data
    c_data = CandidateProfileSerializer(candidate_profile).data

    return Response({
        'user_profile': u_data,
        'candidate_profile': c_data,
    })

@api_view(['GET'])
def get_CandidateProfile(request):
    candidate_profiles = CandidateProfile.objects.all()
    serializer = CandidateProfileSerializer(candidate_profiles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_UserProfile(request):
    user_profiles = UserProfile.objects.all()
    serializer = UserProfileSerializer(user_profiles, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST', 'DELETE'])
@csrf_exempt
def resume_list_api(request, resume_id=None):
    if not request.user.is_authenticated and not request.data.get('user_id'):
        user = User.objects.first()
    else:
        user_id = request.data.get('user_id') or request.user.id
        user = User.objects.filter(id=user_id).first()

    if not user:
        return Response({'error': 'User not found'}, status=404)

    candidate_profile, _ = CandidateProfile.objects.get_or_create(user=user)

    if request.method == 'GET':
        resumes = Resume.objects.filter(candidate=candidate_profile)
        serializer = ResumeSerializer(resumes, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        title = request.data.get('title', 'My Resume')
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=400)
        
        resume = Resume.objects.create(
            candidate=candidate_profile,
            title=title,
            file=file_obj,
            is_default=request.data.get('is_default', False)
        )
        return Response(ResumeSerializer(resume).data, status=201)

    elif request.method == 'DELETE':
        if not resume_id:
            return Response({'error': 'Resume ID required'}, status=400)
        Resume.objects.filter(id=resume_id, candidate=candidate_profile).delete()
        return Response({'message': 'Resume deleted successfully'})
