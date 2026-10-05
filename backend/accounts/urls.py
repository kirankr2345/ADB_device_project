from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('ping/', views.ping, name='ping'),
    path('', views.register_user, name='home'),
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('candidate-profiles/', get_CandidateProfile, name='candidate-profile-list'),
    path('user-profiles/', get_UserProfile, name='user-profile-list'),

]


