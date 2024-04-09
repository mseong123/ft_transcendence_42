from django.shortcuts import render, redirect
from django.urls import path
from . import views

app_name = "auth_user"

urlpatterns = [
    path("send_otp/", views.send_otp, name="send_otp"),
    path("login/", views.login_with_otp, name="login"),
    path("get_username/", views.get_username, name="user"),
	path("session_auth/", views.session_auth, name="session_auth"),
	path("update_match_score/", views.update_match_score, name="update_match_score"),
	path("get_tournament_info/", views.get_tournament_info, name="update_match_score"),
	path("create_tournament/", views.createTournament, name="create_tournament"),
]