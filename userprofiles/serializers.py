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
    def validate_nick_name(self, value):
        """
        Test: Additional validation for nickname
        """
        # print("validate nickname(self):", self)
        # print("validate nickname(value):", value)
        # # Explore Self
        # print("self:", self.instance.user)
        user = User.objects.filter(username=value)
        if user.exists():
            if str(self.instance.user) != value:
                raise serializers.ValidationError("Cannot use another users username.")
        return value
