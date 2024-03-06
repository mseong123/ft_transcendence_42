from django.urls import path, include
from userprofiles.views import (
    profile_view,
    edit_profile_view,
    UserProfilesViewSet,
    UserViewSet,
    # UserProfilesAPIView,
)
app_name = 'users'

from rest_framework.routers import DefaultRouter, SimpleRouter


router = DefaultRouter()
router.register('users', UserViewSet)
router.register('profiles', UserProfilesViewSet)

urlpatterns = [
    # path('<username>/', profile_view, name="view"),
    # path('<username>/edit/', edit_profile_view, name="edit"),

    ######## API ########
    path('', include(router.urls))
    # path('', UserProfilesViewSet.as_view({'get': 'list', 'post':'create'}), name='userprofileslist'),
    # path('<user>/', UserProfilesViewSet.as_view({'get': 'list', 'post':'create'}), name='userprofileslist'),
    # path('<str:pk>', UserProfilesAPIView.as_view(), name='userprofiles')
    #####################
]