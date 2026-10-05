from django.urls import path
from . import views

urlpatterns = [
    path('applications/', views.application_list_create, name='application_list_create'),
    path('applications/<int:app_id>/', views.application_detail_update, name='application_detail_update'),
    path('interviews/', views.interview_api, name='interview_api'),
    path('notifications/', views.notification_api, name='notification_list_api'),
    path('notifications/<int:notif_id>/', views.notification_api, name='notification_detail_api'),
]
