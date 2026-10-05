from rest_framework import serializers
from .models import Company, JobCategory, Skill, Job, SavedJob, JobAlert
from accounts.serializer import RecruiterProfileSerializer, CandidateProfileSerializer

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    company_detail = CompanySerializer(source='company', read_only=True)
    category_detail = JobCategorySerializer(source='category', read_only=True)
    skills_detail = SkillSerializer(source='skills', many=True, read_only=True)

    class Meta:
        model = Job
        fields = '__all__'

class SavedJobSerializer(serializers.ModelSerializer):
    job_detail = JobSerializer(source='job', read_only=True)

    class Meta:
        model = SavedJob
        fields = '__all__'