from django.contrib import admin

# Register your models here.
from matches.models import MatchHistory, Matches

class MatchesAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(Matches, MatchesAdmin)
admin.site.register(MatchHistory)