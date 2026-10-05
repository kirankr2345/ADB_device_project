from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('jobs/', views.job_list, name='job-list'),
    path('companies/', views.get_company_detail, name='get_company_list'),
    path('companies/<int:company_id>/', views.get_company_detail, name='get_company_detail'),
]