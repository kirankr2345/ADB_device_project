from rest_framework import serializers
from .models import JobApplication, ApplicationStatusHistory, Interview, Notification
from jobs.serializer import JobSerializer
from accounts.serializer import CandidateProfileSerializer, ResumeSerializer

class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatusHistory
        fields = '__all__'

class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class JobApplicationSerializer(serializers.ModelSerializer):
    job_detail = JobSerializer(source='job', read_only=True)
    candidate_detail = CandidateProfileSerializer(source='candidate', read_only=True)
    resume_detail = ResumeSerializer(source='resume', read_only=True)
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)
    interviews = InterviewSerializer(many=True, read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
