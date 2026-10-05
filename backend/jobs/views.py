from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Company, Job
from .serializer import CompanySerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response


@require_GET
def job_list(request):
    jobs = (
        Job.objects.filter(is_active=True)
        .select_related('company', 'category')
        .prefetch_related('skills')
    )

    search = request.GET.get('search', '').strip()
    location = request.GET.get('location', '').strip()
    work_mode = request.GET.get('work_mode', '').strip()
    category = request.GET.get('category', '').strip()

    if search:
        jobs = jobs.filter(
            Q(title__icontains=search)
            | Q(description__icontains=search)
            | Q(company__name__icontains=search)
            | Q(skills__name__icontains=search)
        ).distinct()

    if location:
        jobs = jobs.filter(location__icontains=location)

    if work_mode:
        jobs = jobs.filter(work_mode=work_mode)

    if category:
        jobs = jobs.filter(category__name__iexact=category)

    data = [
        {
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'company': CompanySerializer(job.company).data,
            'location': job.location,
            'work_mode': job.get_work_mode_display(),
            'job_type': job.get_job_type_display(),
            'experience': job.experience,
            'salary_min': str(job.salary_min) if job.salary_min is not None else None,
            'salary_max': str(job.salary_max) if job.salary_max is not None else None,
            'category': job.category.name if job.category else None,
            'skills': list(job.skills.values_list('name', flat=True)),
            'vacancies': job.vacancies,
            'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
            'is_active': job.is_active,
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat(),
        }
        for job in jobs[:100]
    ]
    return JsonResponse({'count': len(data), 'results': data})


@api_view(['GET'])
def get_company_detail(request, company_id=None):
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

