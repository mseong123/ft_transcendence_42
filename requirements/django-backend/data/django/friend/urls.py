from django.urls import path, include
from rest_framework.routers import DefaultRouter
from friend.views import (FriendListViewSet, FriendRequestViewSet)

router = DefaultRouter()
router.register('FriendList', FriendListViewSet)
router.register('FriendRequest', FriendRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]