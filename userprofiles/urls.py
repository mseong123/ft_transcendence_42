from django.urls import path
from userprofiles.views import (
    profile_view,
    edit_profile_view,
    UserProfilesAPIView,
)

app_name = 'users'

urlpatterns = [
    path('<username>/', profile_view, name="view"),
    path('<username>/edit/', edit_profile_view, name="edit"),

    ####### API ########
    path('', UserProfilesAPIView.as_view(), name='userprofiles')
]