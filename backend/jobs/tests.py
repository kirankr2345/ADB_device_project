from django.test import TestCase
from django.urls import reverse

from .models import Company, Job


class CompanyEndpointTests(TestCase):
	def setUp(self):
		self.first_company = Company.objects.create(name='Northstar Labs')
		self.second_company = Company.objects.create(name='Atlas Works')

	def test_company_list_returns_all_companies_with_ids(self):
		response = self.client.get(reverse('get_company_list'))

		self.assertEqual(response.status_code, 200)
		companies = response.json()
		self.assertEqual(
			[(company['id'], company['name']) for company in companies],
			[
				(self.second_company.id, 'Atlas Works'),
				(self.first_company.id, 'Northstar Labs'),
			],
		)

	def test_company_detail_still_returns_one_company(self):
		response = self.client.get(reverse('get_company_detail', args=[self.first_company.id]))

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['id'], self.first_company.id)
		self.assertEqual(response.json()['name'], 'Northstar Labs')


class JobListEndpointTests(TestCase):
	def test_job_list_includes_company_details_for_job_cards(self):
		company = Company.objects.create(
			name='Northstar Labs',
			industry='Software',
			company_size='50-200 employees',
			location='Bengaluru',
			founded_year=2014,
		)
		job = Job.objects.create(
			company=company,
			title='Frontend Engineer',
			description='Build web applications.',
			location='Bengaluru',
		)

		response = self.client.get(reverse('job-list'))

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['count'], 1)
		result = response.json()['results'][0]
		self.assertEqual(result['id'], job.id)
		self.assertEqual(result['title'], 'Frontend Engineer')
		self.assertEqual(result['company']['id'], company.id)
		self.assertEqual(result['company']['name'], 'Northstar Labs')
		self.assertEqual(result['company']['industry'], 'Software')
		self.assertEqual(result['company']['founded_year'], 2014)
