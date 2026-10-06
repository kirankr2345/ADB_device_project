from django.urls import path
from . import views

urlpatterns = [
    path('ping/', views.ping, name='ping'),
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('me/', views.ProfileView.as_view(), name='profile_view'),
    path('profile/', views.user_profile_detail, name='user_profile_detail'),
    path('profile/<int:user_id>/', views.user_profile_detail, name='user_profile_detail_id'),
    path('candidate-profiles/', views.get_CandidateProfile, name='candidate-profile-list'),
    path('user-profiles/', views.get_UserProfile, name='user-profile-list'),
    path('resumes/', views.resume_list_api, name='resume_list_api'),
    path('resumes/<int:resume_id>/', views.resume_list_api, name='resume_detail_api'),
]
