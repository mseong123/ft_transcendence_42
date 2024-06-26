from django.contrib import admin

# Register your models here.
from matches.models import MatchHistory, Matches, Tournaments

class TournamentsAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_winner', 'created_on')

    @admin.display(description='Winner')
    def get_winner(self, obj):
        return obj.winner

class MatchesAdmin(admin.ModelAdmin):
    list_display = ('id', 't1_points', 't2_points', 'created_on')
    # readonly_fields = ('id',)

class MatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_matches')
    # readonly_fields = ('id',)

admin.site.register(Tournaments, TournamentsAdmin)
admin.site.register(Matches, MatchesAdmin)
admin.site.register(MatchHistory, MatchHistoryAdmin)