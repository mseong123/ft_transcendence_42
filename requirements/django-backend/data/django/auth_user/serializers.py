from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AuthUser

class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ('otp', 'otp_expiry_time')

# Add AccountSerializer to your UserSerializer