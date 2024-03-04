from rest_framework import serializers
from userprofiles.models import Profile

class UserProfilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile