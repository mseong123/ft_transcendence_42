from datetime import timedelta, timezone
from django.shortcuts import render, redirect

# Create your views here.
from django.conf import settings
from django.http import HttpResponseRedirect, HttpResponse
import requests
from allauth.socialaccount.models import SocialApp
from urllib.parse import quote
from django.urls import reverse
from django.contrib.auth.views import PasswordResetConfirmView
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework_simplejwt.views import TokenRefreshView

# def email_confirm_redirect(request, key):
#     return HttpResponseRedirect(
#         f"{settings.EMAIL_CONFIRM_REDIRECT_BASE_URL}{key}/"
#     )

# def password_reset_confirm_redirect(request, uidb64, token):
#     return HttpResponseRedirect(
#         f"{settings.PASSWORD_RESET_CONFIRM_REDIRECT_BASE_URL}{uidb64}/{token}/"
#     )

from dj_rest_auth.registration.views import SocialLoginView
from provider.views import FourtyTwoAdapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

class FourtyTwoLogin(SocialLoginView):
    adapter_class = FourtyTwoAdapter
    client_class = OAuth2Client
    callback_url = settings.BASE_URL

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add any additional context data here
        context["uidb64"] = self.kwargs["uidb64"]
        context["token"] = self.kwargs["token"]
        return context

# Customizes the url of verification link sent to user email upon registration
class CustomAccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        base_url = settings.BASE_URL
        confirmation_key = emailconfirmation.key
        return f'{base_url}verify/{confirmation_key}/'


# class CustomTokenRefreshView(TokenRefreshView):
#     def post(self, request, *args, **kwargs):
#         if 'refresh_token' in request.POST:
#             request.data['refresh'] = request.POST['refresh_token']
#         response = super().post(request, *args, **kwargs)
#         # if 'access' in response.data:
#         #     access_token = response.data['access']
#         #     response.set_cookie('access_token', access_token, httponly=True)
#         # if 'refresh' in response.data:
#         #     refresh_token = response.data['refresh']
#         #     response.set_cookie('refresh_token', refresh_token, httponly=True, path="/api/auth/token/refresh/")
#         return response