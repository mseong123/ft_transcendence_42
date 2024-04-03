from rest_framework import serializers
from friend.models import FriendList, FriendRequest
from django.contrib.auth.models import User

class FriendListSerializer(serializers.ModelSerializer):
    user    = serializers.StringRelatedField(many=True, read_only=True)
    friend  = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = FriendList
        fields = ('id', 'user', 'friends')

class FriendRequestSerializer(serializers.ModelSerializer):
    sender      = serializers.StringRelatedField(read_only=True)
    receiver    = serializers.StringRelatedField(read_only=True)
    is_active   = serializers.BooleanField(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ('id', 'sender', 'receiver', 'is_active', 'timestamp')
