from rest_framework import serializers
from django.contrib.auth.models import User
from friend.models import FriendList, FriendRequest

class FriendListSerializer(serializers.ModelSerializer):
    friends = serializers.StringRelatedField(many=True)
    class Meta:
        model = FriendList
        fields = ('__all__')
        lookup_field = 'user__username'


class FriendRequestSerializer(serializers.ModelSerializer):
    is_active	= serializers.BooleanField(default=True)

    class Meta:
        model = FriendRequest
        fields = ('id', 'sender', 'receiver', 'is_active')
        lookup_field = 'sender__username'
