from django.urls import path, include
from rest_framework.routers import DefaultRouter
from friend.views import testClass

router = DefaultRouter()
router.register('testClass', testClass)

urlpatterns = [
    path('', include(router.urls))
]