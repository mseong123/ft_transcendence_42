from rest_framework import serializers
from matches.models import Matches, MatchHistory
from django.contrib.auth.models import User
from django.db.models import Prefetch

class UsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)

class MatchesSerializer(serializers.ModelSerializer):
    t1 = serializers.StringRelatedField(many=True, read_only=True)
    t2 = serializers.StringRelatedField(many=True, read_only=True)
    class Meta:
        model = Matches
        fields = ('id', 't1', 't2', 't1_points', 't2_points', 'created_on')

# def get_last_ten_matches(self, obj):
#     print("here")
#     print(obj)
#     return obj.matches.all()

class MatchHistorySerializer(serializers.ModelSerializer):
    id = serializers.CharField(
        source="pk", read_only=True)
    username = serializers.CharField(
        source="user", read_only=True)
    matches = serializers.SerializerMethodField()

    class Meta:
        model = MatchHistory
        fields = ('id', 'username', 'matches')
        lookup_field = 'user__username'

    def get_matches(self, instance):
        matches = instance.matches.all().order_by('-created_on')[:10]
        return MatchesSerializer(matches, many=True, read_only=True).data