"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.views.generic.base import RedirectView
from game.views import get_tournament_info

urlpatterns = [
    path('api/auth/', include('authentication.urls')),
    path('api/auth_user/', include('auth_user.urls')),
    # path('api/', include('dj_rest_auth.urls')),
    path('api/accounts/', include('userprofiles.urls')),
    path('api/friend/', include('friend.urls')),
    path('api/matches/', include('matches.urls')),
    path('api/schema', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name="schema")),
    # path('accounts/', include('allauth.urls')),
    path('admin/', admin.site.urls),
    # path('email/confirm/', TemplateView.as_view(template_name='email_verification.html'), name='VerifyEmail'),
    # path('password-reset/confirm', TemplateView.as_view(template_name='password_rest.html'), name='ResetPassword'),
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    path('verify/<str:key>/', TemplateView.as_view(template_name='index.html'), name='index'),
	#  path('', TemplateView.as_view(template_name='home.html'), name='home'),
    # path('verify/<str:key>/', TemplateView.as_view(template_name='home.html'), name='home'),
    path('chat/', include('chatroom.urls')),
	path('favicon.ico', RedirectView.as_view(url='/static/game/assets/favicon.ico')),
    path('tournament/info/', get_tournament_info),
	re_path(r'^.*$', RedirectView.as_view(url='/')),
]

if settings.DEBUG is True:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
