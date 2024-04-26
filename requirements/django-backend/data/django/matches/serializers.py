from rest_framework import serializers
from matches.models import Matches, MatchHistory, Tournaments
from django.contrib.auth.models import User
from django.db.models import Prefetch

class MatchesSerializer(serializers.ModelSerializer):
	t1              = serializers.StringRelatedField(many=True, read_only=True)
	t2              = serializers.StringRelatedField(many=True, read_only=True)
	
	class Meta:
		model = Matches
		fields = ('id', 't1', 't2', 't1_points', 't2_points', 'created_on')

class TournamentsSerializer(serializers.ModelSerializer):
	winner              = serializers.StringRelatedField(read_only=True)
	matches             = MatchesSerializer(many=True, read_only=True)
	class Meta:
		model = Tournaments
		fields = ('id', 'winner', 'matches', 'created_on', 'blockchain_tx')

class MatchHistorySerializer(serializers.ModelSerializer):
	id              = serializers.CharField(source="pk", read_only=True)
	username        = serializers.CharField(source="user", read_only=True)
	matches         = serializers.SerializerMethodField(method_name="get_matches")
	tournaments     = serializers.SerializerMethodField(method_name="get_tournaments")

	class Meta:
		model = MatchHistory
		fields = ('id', 'username', 'matches', 'tournaments')
		lookup_field = 'user__username'

	def get_matches(self, instance):
		matches = instance.matches.all().order_by('-created_on')[:10]
		return MatchesSerializer(matches, many=True, read_only=True).data
	
	def get_tournaments(self, instance):
		tournaments = instance.tournaments.all().order_by('-created_on')[:10]
		return TournamentsSerializer(tournaments, many=True, read_only=True).data