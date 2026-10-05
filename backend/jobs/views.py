from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Company, Job, JobCategory, Skill, SavedJob
from .serializer import (
    CompanySerializer, JobCategorySerializer, SkillSerializer,
    JobSerializer, SavedJobSerializer
)
from accounts.models import RecruiterProfile, CandidateProfile
from django.contrib.auth.models import User

def serialize_job(job):
    return {
        'id': job.id,
        'title': job.title,
        'description': job.description,
        'company': CompanySerializer(job.company).data if job.company else None,
        'location': job.location,
        'work_mode': job.get_work_mode_display() if hasattr(job, 'get_work_mode_display') else job.work_mode,
        'job_type': job.get_job_type_display() if hasattr(job, 'get_job_type_display') else job.job_type,
        'experience': job.experience,
        'salary_min': str(job.salary_min) if job.salary_min is not None else None,
        'salary_max': str(job.salary_max) if job.salary_max is not None else None,
        'category': job.category.name if job.category else None,
        'category_id': job.category_id,
        'skills': list(job.skills.values_list('name', flat=True)),
        'vacancies': job.vacancies,
        'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
        'is_active': job.is_active,
        'recruiter_id': job.recruiter_id,
        'created_at': job.created_at.isoformat(),
        'updated_at': job.updated_at.isoformat(),
    }

@api_view(['GET', 'POST'])
@csrf_exempt
def job_list(request):
    if request.method == 'GET':
        jobs = (
            Job.objects.filter(is_active=True)
            .select_related('company', 'category')
            .prefetch_related('skills')
        )

        search = request.GET.get('search', '').strip()
        location = request.GET.get('location', '').strip()
        work_mode = request.GET.get('work_mode', '').strip()
        category = request.GET.get('category', '').strip()
        job_type = request.GET.get('job_type', '').strip()

        if search:
            jobs = jobs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(company__name__icontains=search)
                | Q(skills__name__icontains=search)
            ).distinct()

        if location:
            jobs = jobs.filter(location__icontains=location)

        if work_mode and work_mode.lower() != 'all':
            jobs = jobs.filter(work_mode__iexact=work_mode)

        if category and category.lower() != 'all':
            jobs = jobs.filter(Q(category__name__iexact=category) | Q(category__id=category if category.isdigit() else -1))

        if job_type and job_type.lower() != 'all':
            jobs = jobs.filter(job_type__iexact=job_type)

        data = [serialize_job(job) for job in jobs[:100]]
        return JsonResponse({'count': len(data), 'results': data})

    elif request.method == 'POST':
        data = request.data
        company_id = data.get('company_id')
        if not company_id:
            # Check if company name provided, create or find
            company_name = data.get('company_name', 'Tech Corp')
            company, _ = Company.objects.get_or_create(name=company_name)
            company_id = company.id
        else:
            company = Company.objects.filter(id=company_id).first()

        category_obj = None
        if data.get('category_name'):
            category_obj, _ = JobCategory.objects.get_or_create(name=data.get('category_name'))

        job = Job.objects.create(
            company_id=company_id,
            title=data.get('title', 'Software Engineer'),
            description=data.get('description', ''),
            category=category_obj,
            job_type=data.get('job_type', 'full_time'),
            experience=data.get('experience', '0-2'),
            work_mode=data.get('work_mode', 'onsite'),
            location=data.get('location', 'Remote'),
            salary_min=data.get('salary_min'),
            salary_max=data.get('salary_max'),
            vacancies=data.get('vacancies', 1),
            application_deadline=data.get('application_deadline'),
            is_active=True
        )

        skills_list = data.get('skills', [])
        if isinstance(skills_list, str):
            skills_list = [s.strip() for s in skills_list.split(',') if s.strip()]
        for s_name in skills_list:
            sk, _ = Skill.objects.get_or_create(name=s_name)
            job.skills.add(sk)

        return Response(serialize_job(job), status=201)

@api_view(['GET', 'PUT', 'DELETE'])
@csrf_exempt
def job_detail(request, job_id):
    job = Job.objects.filter(id=job_id).first()
    if not job:
        return Response({'error': 'Job not found'}, status=404)

    if request.method == 'GET':
        return Response(serialize_job(job))

    elif request.method == 'PUT':
        data = request.data
        if 'title' in data: job.title = data['title']
        if 'description' in data: job.description = data['description']
        if 'location' in data: job.location = data['location']
        if 'work_mode' in data: job.work_mode = data['work_mode']
        if 'job_type' in data: job.job_type = data['job_type']
        if 'experience' in data: job.experience = data['experience']
        if 'salary_min' in data: job.salary_min = data['salary_min']
        if 'salary_max' in data: job.salary_max = data['salary_max']
        if 'is_active' in data: job.is_active = data['is_active']
        job.save()
        return Response(serialize_job(job))

    elif request.method == 'DELETE':
        job.delete()
        return Response({'message': 'Job deleted successfully'})

@api_view(['GET', 'POST'])
@csrf_exempt
def get_company_detail(request, company_id=None):
    if request.method == 'GET':
        if company_id is None:
            company_id = request.query_params.get('company_id')
        if company_id is None:
            companies = Company.objects.all().order_by('name')
            serializer = CompanySerializer(companies, many=True)
            return Response(serializer.data)

        company_details = Company.objects.filter(id=company_id).first()
        if company_details is None:
            return Response({'error': 'Company not found'}, status=404)
        serializer = CompanySerializer(company_details)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'POST', 'DELETE'])
@csrf_exempt
def saved_jobs_api(request, saved_id=None):
    user_id = request.data.get('user_id') or (request.user.id if request.user.is_authenticated else None)
    if not user_id and request.method == 'GET':
        user_id = request.GET.get('user_id')

    user = User.objects.filter(id=user_id).first() if user_id else User.objects.first()
    if not user:
        return Response({'error': 'User authentication required'}, status=400)

    candidate_profile, _ = CandidateProfile.objects.get_or_create(user=user)

    if request.method == 'GET':
        saved = SavedJob.objects.filter(candidate=candidate_profile)
        serializer = SavedJobSerializer(saved, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        job_id = request.data.get('job_id')
        job = Job.objects.filter(id=job_id).first()
        if not job:
            return Response({'error': 'Job not found'}, status=404)
        saved_job, created = SavedJob.objects.get_or_create(candidate=candidate_profile, job=job)
        return Response(SavedJobSerializer(saved_job).data, status=201 if created else 200)

    elif request.method == 'DELETE':
        job_id = request.data.get('job_id')
        if job_id:
            SavedJob.objects.filter(candidate=candidate_profile, job_id=job_id).delete()
        elif saved_id:
            SavedJob.objects.filter(candidate=candidate_profile, id=saved_id).delete()
        return Response({'message': 'Saved job removed'})

@api_view(['GET'])
def category_list_api(request):
    categories = JobCategory.objects.all().order_by('name')
    serializer = JobCategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def skill_list_api(request):
    skills = Skill.objects.all().order_by('name')
    serializer = SkillSerializer(skills, many=True)
    return Response(serializer.data)
