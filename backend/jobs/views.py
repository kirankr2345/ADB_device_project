from django.shortcuts import render

# Create your views here.
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import Job


@require_GET
def job_list(request):
	jobs = Job.objects.filter(is_active=True).select_related('company', 'category').prefetch_related('skills')
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
			'company': job.company.name,
			'company_location': job.company.location,
			'location': job.location,
			'work_mode': job.get_work_mode_display(),
			'job_type': job.get_job_type_display(),
			'experience': job.experience,
			'salary_min': str(job.salary_min) if job.salary_min is not None else None,
			'salary_max': str(job.salary_max) if job.salary_max is not None else None,
			'category': job.category.name if job.category else None,
			'skills': list(job.skills.values_list('name', flat=True)),
			'created_at': job.created_at.isoformat(),
		}
		for job in jobs[:100]
	]
	return JsonResponse({'count': len(data), 'results': data})
