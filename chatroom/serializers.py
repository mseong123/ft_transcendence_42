from rest_framework import serializers
from .models import BlockList
from django.contrib.auth.models import User

class BlockListSerializer(serializers.ModelSerializer):
    id          = serializers.CharField(source="pk", read_only=True)
    username    = serializers.CharField(source="user", read_only=True)
    blocklist   = serializers.SerializerMethodField()

    class Meta:
        model = BlockList
        fields = ('id', 'username', 'blocklist')
        read_only_fields = ('win', 'lose')
        lookup_field = 'user__username'

