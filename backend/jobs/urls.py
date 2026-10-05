from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.job_list, name='job-list'),
    path('jobs/<int:job_id>/', views.job_detail, name='job-detail'),
    path('companies/', views.get_company_detail, name='get_company_list'),
    path('companies/<int:company_id>/', views.get_company_detail, name='get_company_detail'),
    path('saved-jobs/', views.saved_jobs_api, name='saved_jobs_api'),
    path('saved-jobs/<int:saved_id>/', views.saved_jobs_api, name='saved_jobs_detail_api'),
    path('categories/', views.category_list_api, name='category_list_api'),
    path('skills/', views.skill_list_api, name='skill_list_api'),
]