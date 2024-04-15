from django.contrib import admin

from .models import BlockList
# Register your models here.


class BlockListAdmin(admin.ModelAdmin):
    list_display = ('user',)
    # readonly_fields = ('id',)

admin.site.register(BlockList, BlockListAdmin)