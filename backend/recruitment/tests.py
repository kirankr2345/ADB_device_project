from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from jobs.models import Company, Job
from accounts.models import CandidateProfile, UserProfile
from recruitment.models import JobApplication

class RecruitmentEndpointTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='john_candidate', password='password123')
        self.candidate_profile = CandidateProfile.objects.create(user=self.user)
        self.company = Company.objects.create(name='Acme Corp')
        self.job = Job.objects.create(
            company=self.company,
            title='Backend Developer',
            description='Build REST APIs',
            location='Remote'
        )

    def test_submit_job_application(self):
        url = reverse('application_list_create')
        data = {
            'user_id': self.user.id,
            'job_id': self.job.id,
            'cover_letter': 'I am excited about this role.'
        }
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(JobApplication.objects.count(), 1)
        app = JobApplication.objects.first()
        self.assertEqual(app.status, 'applied')
        self.assertEqual(app.cover_letter, 'I am excited about this role.')

    def test_prevent_duplicate_application(self):
        JobApplication.objects.create(
            job=self.job,
            candidate=self.candidate_profile,
            cover_letter='First application'
        )
        url = reverse('application_list_create')
        data = {
            'user_id': self.user.id,
            'job_id': self.job.id,
        }
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('already applied', response.json()['error'])

    def test_update_application_status(self):
        app = JobApplication.objects.create(
            job=self.job,
            candidate=self.candidate_profile,
            status='applied'
        )
        url = reverse('application_detail_update', args=[app.id])
        data = {
            'status': 'shortlisted',
            'comment': 'Good experience'
        }
        response = self.client.patch(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        app.refresh_from_db()
        self.assertEqual(app.status, 'shortlisted')
