from django.db import models

# Create your models here.
from django.db import models


class Company(models.Model):
	name = models.CharField(max_length=200)
	logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
	description = models.TextField(blank=True)
	website = models.URLField(blank=True)
	industry = models.CharField(max_length=150, blank=True)
	company_size = models.CharField(max_length=50, blank=True)
	location = models.CharField(max_length=150, blank=True)
	founded_year = models.PositiveIntegerField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.name


class JobCategory(models.Model):
	name = models.CharField(max_length=100, unique=True)
	description = models.TextField(blank=True)

	def __str__(self):
		return self.name


class Skill(models.Model):
	name = models.CharField(max_length=100, unique=True)

	def __str__(self):
		return self.name


class Job(models.Model):
	JOB_TYPE_CHOICES = (
		('full_time', 'Full Time'),
		('part_time', 'Part Time'),
		('internship', 'Internship'),
		('contract', 'Contract'),
		('freelance', 'Freelance'),
	)
	WORK_MODE_CHOICES = (
		('onsite', 'Onsite'),
		('remote', 'Remote'),
		('hybrid', 'Hybrid'),
	)

	company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
	recruiter = models.ForeignKey('accounts.RecruiterProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
	title = models.CharField(max_length=200)
	description = models.TextField()
	category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
	skills = models.ManyToManyField(Skill, related_name='jobs', blank=True)
	job_type = models.CharField(max_length=30, choices=JOB_TYPE_CHOICES, default='full_time')
	experience = models.CharField(max_length=30, default='0-1')
	work_mode = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, default='onsite')
	location = models.CharField(max_length=150, blank=True)
	salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
	salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
	vacancies = models.PositiveIntegerField(default=1)
	application_deadline = models.DateField(null=True, blank=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ('-created_at',)

	def __str__(self):
		return self.title


class SavedJob(models.Model):
	candidate = models.ForeignKey('accounts.CandidateProfile', on_delete=models.CASCADE, related_name='saved_jobs')
	job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
	saved_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [models.UniqueConstraint(fields=('candidate', 'job'), name='unique_saved_job')]


class JobAlert(models.Model):
	candidate = models.ForeignKey('accounts.CandidateProfile', on_delete=models.CASCADE, related_name='job_alerts')
	keyword = models.CharField(max_length=150, blank=True)
	location = models.CharField(max_length=150, blank=True)
	category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, blank=True)
	job_type = models.CharField(max_length=30, blank=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
