from django.urls import path, include

from . import views

from rest_framework.routers import DefaultRouter, SimpleRouter
from .views import BlockListViewSet


router = DefaultRouter()
router.register('blocklist', BlockListViewSet)


urlpatterns = [
    path('', include(router.urls)),
    # path("", views.index, name="index"),
    # path("game/<str:room_name>/", views.room, name="room"),
    # path("lobby/", views.lobby, name="lobby"),
]