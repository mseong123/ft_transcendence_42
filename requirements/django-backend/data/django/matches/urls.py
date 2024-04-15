from django.urls import path, include

# app_name = 'users'
from rest_framework.routers import DefaultRouter, SimpleRouter
from matches.views import MatchHistoryViewSet


router = DefaultRouter()
router.register('match', MatchHistoryViewSet)
# router.register('profiles', UserProfilesViewSet)

urlpatterns = [

    ######## API ########
    path('', include(router.urls))
    # path('', UserProfilesViewSet.as_view({'get': 'list', 'post':'create'}), name='userprofileslist'),
    # path('<user>/', UserProfilesViewSet.as_view({'get': 'list', 'post':'create'}), name='userprofileslist'),
    # path('<str:pk>', UserProfilesAPIView.as_view(), name='userprofiles')
    #####################
]