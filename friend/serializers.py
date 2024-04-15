from rest_framework import serializers
from django.contrib.auth.models import User
from friend.models import FriendList, FriendRequest

class FriendListSerializer(serializers.ModelSerializer):
    friends = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all())

    class Meta:
        model = FriendList
        fields = ('__all__')
        lookup_field = 'user__username'

class UserField(serializers.RelatedField):
    def display_value(self, instance):
        # print("RelatedField displya_value self:", self)
        # print("RelatedField displya_value instance:", instance)
        return instance

    def to_representation(self, value):
        # print("RelatedField to_representation self:", self)
        # print("RelatedField to_representation value:", value)
        return str(value)
    
    def to_internal_value(self, data):
        # print("RelatedField to_internal_value self:", self)
        # print("RelatedField to_internal_value data:", data)
        return User.objects.get(username=data)

class FriendRequestSerializer(serializers.ModelSerializer):
    sender=UserField(queryset=User.objects.all())
    receiver=UserField(queryset=User.objects.all())
    is_active	= serializers.BooleanField(default=True)

    class Meta:
        model = FriendRequest
        fields = ('id', 'sender', 'receiver', 'is_active')
        lookup_field = 'sender__username'
