from django.db import models


from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):

    def populate_user(self, request, sociallogin, data):
        '''
        Overwrite some data used to init social account to user account
        change username to 42 login
        data here comes from provider.FourtyTwoProvider.extract_common_fields
        '''
        user = super().populate_user(request, sociallogin, data)
        # print("Model.py: data:", data, "request:", request, "social:", sociallogin)
        # Replaces all "_" with "-" and append "-42" to the back of username 
        user.username = str(data['user']).replace("_", "-") + "-42"
        return user