from django.db import models

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
	ROLE_CHOICES = (
		('candidate', 'Candidate'),
		('recruiter', 'Recruiter'),
	)

	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
	phone = models.CharField(max_length=20, blank=True)
	location = models.CharField(max_length=150, blank=True)
	profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.user.get_full_name() or self.user.username


class CandidateProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
	headline = models.CharField(max_length=200, blank=True)
	bio = models.TextField(blank=True)
	current_job_title = models.CharField(max_length=150, blank=True)
	experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0)
	expected_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
	preferred_location = models.CharField(max_length=150, blank=True)
	skills = models.ManyToManyField('jobs.Skill', related_name='candidates', blank=True)
	linkedin_url = models.URLField(blank=True)
	github_url = models.URLField(blank=True)
	portfolio_url = models.URLField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.user.get_full_name() or self.user.username


class RecruiterProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
	company = models.ForeignKey('jobs.Company', on_delete=models.CASCADE, related_name='recruiters')
	designation = models.CharField(max_length=100, blank=True)

	def __str__(self):
		return self.user.get_full_name() or self.user.username


class Education(models.Model):
	candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='educations')
	degree = models.CharField(max_length=150)
	institution = models.CharField(max_length=200)
	field_of_study = models.CharField(max_length=150, blank=True)
	start_year = models.PositiveIntegerField()
	end_year = models.PositiveIntegerField(null=True, blank=True)
	grade = models.CharField(max_length=50, blank=True)

	def __str__(self):
		return f'{self.degree} - {self.institution}'


class Experience(models.Model):
	candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='experiences')
	company_name = models.CharField(max_length=200)
	job_title = models.CharField(max_length=150)
	description = models.TextField(blank=True)
	start_date = models.DateField()
	end_date = models.DateField(null=True, blank=True)
	is_current = models.BooleanField(default=False)

	def __str__(self):
		return f'{self.job_title} - {self.company_name}'


class Resume(models.Model):
	candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='resumes')
	title = models.CharField(max_length=150)
	file = models.FileField(upload_to='resumes/')
	is_default = models.BooleanField(default=False)
	uploaded_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.title

