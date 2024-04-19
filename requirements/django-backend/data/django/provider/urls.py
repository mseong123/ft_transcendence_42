from allauth.socialaccount.providers.oauth2.urls import default_urlpatterns
from .provider import FourtyTwoProvider

urlpatterns = default_urlpatterns(FourtyTwoProvider)