from django.shortcuts import render, redirect
from django.urls import path
from . import views

app_name = "auth_user"

urlpatterns = [
    path("send_otp/", views.send_otp, name="send_otp"),
    path("login/", views.login_with_otp, name="login"),
    path("register/", views.register, name="register"),
    path("get_user/", views.get_user, name="user"),
]