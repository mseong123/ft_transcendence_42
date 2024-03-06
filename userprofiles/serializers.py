from rest_framework import serializers
from userprofiles.models import Profile
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('__all__')

class UserProfilesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(
        source="pk", read_only=True)
    username = serializers.CharField(
        source="user", read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'username', 'image', 'nick_name', 'win', 'lose')
        read_only_fields = ('win', 'lose')
        lookup_field = 'user__username'

    # def get_user(self,obj):
    #     return str(obj.user.username)