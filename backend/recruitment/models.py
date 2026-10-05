from django.db import models

# Create your models here.
from django.db import models


class JobApplication(models.Model):
	STATUS_CHOICES = (
		('applied', 'Applied'),
		('reviewing', 'Under Review'),
		('shortlisted', 'Shortlisted'),
		('interview', 'Interview'),
		('selected', 'Selected'),
		('rejected', 'Rejected'),
		('withdrawn', 'Withdrawn'),
	)

	job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='applications')
	candidate = models.ForeignKey('accounts.CandidateProfile', on_delete=models.CASCADE, related_name='applications')
	resume = models.ForeignKey('accounts.Resume', on_delete=models.SET_NULL, null=True, blank=True)
	cover_letter = models.TextField(blank=True)
	status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='applied')
	applied_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		constraints = [models.UniqueConstraint(fields=('job', 'candidate'), name='unique_job_application')]
		ordering = ('-applied_at',)

	def __str__(self):
		return f'{self.candidate} - {self.job}'


class ApplicationStatusHistory(models.Model):
	application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='status_history')
	status = models.CharField(max_length=30, choices=JobApplication.STATUS_CHOICES)
	changed_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
	comment = models.TextField(blank=True)
	changed_at = models.DateTimeField(auto_now_add=True)


class Interview(models.Model):
	INTERVIEW_TYPES = (('phone', 'Phone'), ('online', 'Online'), ('offline', 'Offline'))
	application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='interviews')
	interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPES)
	scheduled_at = models.DateTimeField()
	meeting_link = models.URLField(blank=True)
	location = models.CharField(max_length=200, blank=True)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
	user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='notifications')
	title = models.CharField(max_length=200)
	message = models.TextField()
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
