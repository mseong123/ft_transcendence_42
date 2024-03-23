from rest_framework import serializers
from .models import BlockList
from django.contrib.auth.models import User
from rest_framework.utils import html, model_meta, representation


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username',)

class BlockUserField(serializers.RelatedField):
    def display_value(self, instance):
        print("RelatedField displya_value self:", self)
        print("RelatedField displya_value instance:", instance)
        return instance

    def to_representation(self, value):
        print("RelatedField to_representation self:", self)
        print("RelatedField to_representation value:", value)
        return str(value)
    
    def to_internal_value(self, data):
        print("RelatedField to_internal_value self:", self)
        print("RelatedField to_internal_value data:", data)
        return User.objects.get(username=data)

class BlockListSerializer(serializers.ModelSerializer):
    id          = serializers.CharField(source="pk", read_only=True)
    username    = serializers.CharField(source="user", read_only=True)
    # test   = UserSerializer(source="get_blocklist", many=True, read_only=True)
    # blocklist   = UserSerializer(source="get_blocklist", many=True, read_only=True)
    # blocklist   = serializers.StringRelatedField(many=True, read_only=True)
    blocklist   = BlockUserField(queryset=User.objects.all(), many=True)
    # test   = serializers.SerializerMethodField(method_name="get_blocklist")
    # blocknames   = serializers.StringRelatedField(source="blocklist" ,many=True, read_only=True)

    class Meta:
        model = BlockList
        fields = ('id', 'username', 'blocklist')
        # fields = ('id', 'username', 'blocknames', 'blocklist')
        lookup_field = ('user__username',)

    # def get_blocklist(self, instance):
    #     blocklist = instance.blocklist.all()
    #     print(blocklist)
    #     return UserSerializer(blocklist, many=True, read_only=True).data
    