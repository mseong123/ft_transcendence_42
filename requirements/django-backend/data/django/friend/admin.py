from typing import Any
from django.contrib import admin
from django.db.models.fields.related import ManyToManyField
from django.forms.models import ModelMultipleChoiceField
from django.http import HttpRequest

from friend.models import FriendList, FriendRequest

# Register your models here.
class FriendListAdmin(admin.ModelAdmin):
    list_filter = ['user']
    list_display = ['user']
    filter_horizontal = ['friends']
    search_fields = ['user']

    # def formfield_for_manytomany(self, db_field, request, **kwargs: Any) -> ModelMultipleChoiceField:
    #     for key, value in kwargs.items():
    #         print(f'{key}: {value}')
    #     # if db_field.name == 'friends':
    #         # kwargs['widget'] = 'SOMETHING'
    #     return super().formfield_for_manytomany(db_field, request, **kwargs)

class FriendRequestAdmin(admin.ModelAdmin):
    list_filter = ['sender', 'receiver']
    list_display = ['sender', 'receiver', 'id']
    search_fields = ['sender__username', 'sender__email', 'receiver__username', 'receiver__email',]

admin.site.register(FriendList, FriendListAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin)