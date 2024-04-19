# from django.shortcuts import render
import requests
from allauth.socialaccount.adapter import get_adapter
from allauth.socialaccount.providers.oauth2.views import (OAuth2Adapter, OAuth2LoginView, OAuth2CallbackView)

from .provider import FourtyTwoProvider
from django.conf import settings


class FourtyTwoAdapter(OAuth2Adapter):
    '''
    Subclassing OAuth2Adapter to create custom provider
    Sets all the links required to access 42api
    '''
    provider_id = FourtyTwoProvider.id
    access_token_url = f'{settings.OAUTH_SERVER_BASEURL}/oauth/token'
    profile_url = f'{settings.OAUTH_SERVER_BASEURL}/v2/me'
    authorize_url = f'{settings.OAUTH_SERVER_BASEURL}/oauth/authorize'

    def complete_login(self, request, app, token, **kwargs):
        '''
        Get JSON response from 42api
        '''
        headers = {'Authorization': f'Bearer {token.token}', 'Accept':'application/json'}
        # useremail = kwargs['response']['useremail']
        # resp = requests.get(self.profile_url + f'{useremail}?type=email', headers=headers)
        response = requests.get(self.profile_url, headers=headers)
        # print(response)
        extra_data = response.json()
        # print(extra_data)
        return self.get_provider().sociallogin_from_response(request, extra_data)


oauth2_login = OAuth2LoginView.adapter_view(FourtyTwoAdapter)
oauth2_callback = OAuth2CallbackView.adapter_view(FourtyTwoAdapter)
