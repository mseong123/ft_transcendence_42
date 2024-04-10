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


# redirect_uri = 'http://127.0.0.1:8000/api/auth/callback/'

# def email_confirm_redirect(request, key):
#     return HttpResponseRedirect(
#         f"{settings.EMAIL_CONFIRM_REDIRECT_BASE_URL}{key}/"
#     )

# def password_reset_confirm_redirect(request, uidb64, token):
#     return HttpResponseRedirect(
#         f"{settings.PASSWORD_RESET_CONFIRM_REDIRECT_BASE_URL}{uidb64}/{token}/"
#     )

# def callback(request):
#     if 'code' in request.GET:
#         socialapp =  SocialApp.objects.get(name='FT_TRANSCENDENCE')

#         code = request.GET['code']
#         context = {}
#         context['grant_type'] = 'authorization_code'
#         context['client_id'] = socialapp.client_id
#         context['client_secret'] = socialapp.secret
#         context['code'] = code
#         context['redirect_uri'] = f'{settings.BASE_URL}api/auth/callback/'
#         try:
#             response = requests.post('https://api.intra.42.fr/oauth/token', json=context, timeout=10)
#             print("Response POST:", response)
#             data = response.json()
#             if 'error_description' in data:
#                 print("error_description_post_code:", data)
#             access_token = data['access_token']
#             print("access_token:", access_token)
#             # response = requests.get('https://api.intra.42.fr/v2/me?access_token=' + access_token)
#             # data = response.json()
#             # if 'error_description' in data:
#             #     # expired code, please relogin
#             #     return redirect(reverse('home') + '?' + request.GET.urlencode())
#             login = requests.Session()
#             response1 = login.post(f'{settings.BASE_URL}api/auth/fourtytwo/', json=data)
#             data = response1.json()
#             print("Login Header:", login.headers)
#             print("Data:", data)
#             print("response1 cookie:", response1.cookies)
#             response1.cookies.set("Authorization", 'Token {}'.format(data["key"]))
#             CookieJar = response1.cookies
#             # social_login_api = requests.post('http://127.0.0.1:8000/api/auth/fourtytwo/', json=data)
#             # print("POST API:", social_login_api)
#             # data = social_login_api.json()
#             # print("Data POST Api:", data)
#             # return redirect(settings.BASE_URL)
#             # return redirect(reverse("home"))
#             # print(social_login_api.cookies)
#             print("cookiejar:", CookieJar)
#             CookieJar.get_dict
#             response = HttpResponseRedirect('/')
#             response.cookies = CookieJar
#             # for key, value in CookieJar:
#             #     response.set_cookie(key, value)
#             response.set_cookie("Authorization", 'Token {}'.format(data["key"]))
#             # response.cookies.update(social_login_api.cookies)
#             return response
#             # return HttpResponseRedirect(settings.BASE_URL, response)
#             # from django.template import Template
#             # template = Template(settings.BASE_URL)
#             # key = Context(data)
#             # return HttpResponse(template.render(data))
#             # from django.template import loader
#             # template = loader.get_template("/")
#             # return HttpResponse(template.render(data, request=))
#         except Exception as e:
#             return HttpResponse(e)
#     socialapp =  SocialApp.objects.get(name='FT_TRANSCENDENCE')
#     # print("socialapp:", socialapp)
#     # print("client_id:", socialapp.client_id)
#     # print("client_secret:", socialapp.secret)
#     authorize_url = (f'{settings.OAUTH_SERVER_BASEURL}/oauth/authorize' 
#                     '?client_id=' + socialapp.client_id +
#                     '&redirect_uri=' + quote(f'{settings.BASE_URL}api/auth/callback/', safe='') +
#                     '&response_type=code')
#     return redirect(authorize_url)
    
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
        base_url = settings.BASE_URL;
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