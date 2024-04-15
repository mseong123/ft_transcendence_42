from django import forms
# from django.contrib.auth.forms import UserCreationForm
# from django.contrib.auth import authenticate
from userprofiles.models import Profile
from django.conf import settings

# def _language(content):


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('image','hide_email','nick_name')
    def save(self, commit=True):
        profile = super(ProfileUpdateForm, self).save(commit=False)
        profile.image = self.cleaned_data['image']
        profile.nick_name = self.cleaned_data['nick_name']
        profile.hide_email = self.cleaned_data['hide_email']
        if commit:
            profile.save()
        return profile
