from rest_framework.serializers import ModelSerializer
from .models import *


class CompanySerializer(ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        