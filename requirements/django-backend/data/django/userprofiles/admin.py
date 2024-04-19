from django.contrib import admin

# Register your models here.
from userprofiles.models import Profile

class ProfilesAdmin(admin.ModelAdmin):
    list_display = ('user', 'nick_name', 'win', 'lose')


# Register model created and register to be seen in admin dashboard
admin.site.register(Profile, ProfilesAdmin)