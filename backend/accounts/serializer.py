from rest_framework.serializers import ModelSerializer
from .models import UserProfile, CandidateProfile, RecruiterProfile, Education, Experience, Resume

class UserProfileSerializer(ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class CandidateProfileSerializer(ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = '__all__'

class RecruiterProfileSerializer(ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = '__all__'

class EducationSerializer(ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'


class ExperienceSerializer(ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'


class ResumeSerializer(ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'