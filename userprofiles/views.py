from django.shortcuts import render, redirect
from django.http import response
from django.contrib.auth import login, authenticate, logout
from django.conf import settings


from userprofiles.models import Profile
from userprofiles.forms import ProfileUpdateForm
from django.http import HttpResponse
import json

# Create your views here


############# API Views ###############
from rest_framework.generics import ListAPIView
from rest_framework.decorators import api_view, action, authentication_classes
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated, IsAdminUser
from .permissions import IsOwnerStaffEditOrReadOnly, IsOwner, IsAdminUserOrReadOnly
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from userprofiles.serializers import UserProfilesSerializer, UserSerializer
from django.contrib.auth.models import User

@authentication_classes([JWTAuthentication])
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('username')
    serializer_class = UserSerializer
    lookup_field = 'username'

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated, IsAdminUser,]
        return super(UserViewSet, self).get_permissions()

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(username=user)

# @authentication_classes([JWTAuthentication])
class UserProfilesViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication, ]
    queryset = Profile.objects.all().select_related('user')
    serializer_class = UserProfilesSerializer
    lookup_field = 'user__username'

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [IsAuthenticated,]
        else:
            self.permission_classes = [IsAuthenticated, IsOwnerStaffEditOrReadOnly,]
        return super(UserProfilesViewSet, self).get_permissions()

    def destroy(self, request, *args, **kwargs):
        response = {'message': 'Delete function is not offered in this path.'}
        return Response(response, status=status.HTTP_403_FORBIDDEN)
        raise MethodNotAllowed('GET', detail='Method "GET" not allowed without lookup')

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_staff:
            return Profile.objects.all()
        print("getting query set")
        return Profile.objects.filter(user=user)

    @action(detail=True, methods=['GET','DELETE'], permission_classes=[IsAuthenticated, IsOwnerStaffEditOrReadOnly,])
    def delete_account(self, request, *args, **kwargs):
        # print(', '.join(['{}={!r}'.format(k, v) for k, v in kwargs.items()]))
        user = self.request.user
        print("Request user:", user)
        look_up = kwargs.get('user__username')
        print("Look_up:", look_up)
        print("method:", request.method)
        response = Response(
            {'detail': ('DELETE method will permanently delete account.')},
            status=status.HTTP_200_OK,
        )

        try:
            user_object = User.objects.get(username=look_up)
            if look_up != str(user):
                print('Not current user account.')
                response.data = {'detail': ('Not current user account.')}
                response.status_code =status.HTTP_401_UNAUTHORIZED
                return response
            if request.method == 'DELETE':
                print('Account succesasfully deleted.')
                user_object.delete()
                response.data = {'detail': ('Account succesasfully deleted.')}
                response.status_code =status.HTTP_200_OK
                return response      
        except User.DoesNotExist:
            response.data = {'detail': ('Account does not exist.')}
            response.status_code =status.HTTP_404_NOT_FOUND
            return response


        return response


############### MPA #####################
def profile_view(request, *args, **kwargs):
    '''
    Check if is_self (bool)
        if is_friend (bool)
            -1: no_request_sent
             0: They sent request
             1: you sent request
    '''
    context ={} 
    print ("request: ", request)
    username = kwargs.get('username')
    print("username: ", username)
    try:
        # print()
        profile = Profile.objects.get(user__username=username)
        # print("profile:", profile)
    except Profile.DoesNotExist:
        return HttpResponse("profile does not exist")
    if profile:
        # print(profile.user.username, profile.user.email)
        context["username"] = profile.user.username
        context["email"] = profile.user.email
        context["profile_image"] = profile.image.url

        # Define template variable
        is_self = True
        is_friend = False
        hide_email = profile.hide_email
        user = request.user
        # print(user,profile)
        if user.is_authenticated and user != profile.user:
            is_self = False
        elif not user.is_authenticated:
            is_self = False
        # if kwargs.get('JSON'):
        #     is_JSON = True
        # else:
        is_JSON = bool(request.GET.get('JSON'))
        context["is_self"] = is_self
        context["hide_email"] = hide_email
        context["is_friend"] = is_friend
        context["BASE_URL"] = settings.BASE_URL

        if is_JSON is False:
            return render(request, "profile.html", context)
        else:
        # To get JSON data about profile
            return HttpResponse(json.dumps(context), content_type="application/json")

def edit_profile_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect("/")
    username = kwargs.get('username')
    try:
        profile = Profile.objects.get(user__username=username)
        print("profile edit profile.user.pk:", profile.user.pk)
        print("profile edit profile.user:", profile.user)
    except Profile.DoesNotExist:
        print("user does not exist")
        return HttpResponse("profile does not exist")
    user = request.user
    print("user:", profile.image.url)
    if user != profile.user:
        return HttpResponse("Unable to edit someone elses profile")
    context = {}
    if request.POST:
        form = ProfileUpdateForm(request.POST, request.FILES, instance=profile)
        print("Instance is: ", request.user)
        if form.is_valid():
            profile1 = Profile.objects.get(user__username=username)
            print("form:", profile1.image.url)
            if profile1.image.url != "/media/default.jpg":
                profile1.image.delete()
            form.save()
            print("form is saved")
            return redirect("profile:view", username=profile.user)
        else:
            form = ProfileUpdateForm(request.POST, instance=request.user,
                initial = {
                    # "id": profile.user.pk,
                    "image": profile.image,
                    "nick_name": profile.nick_name,
                    "hide_email": profile.hide_email,
                }
            )
            context['form'] = form
    else:
        form = ProfileUpdateForm(
                initial = {
                    # "id": profile.user.pk,
                    "image": profile.image,
                    "nick_name": profile.nick_name,
                    "hide_email": profile.hide_email,
                }
            )
        context['form'] = form
    context['DATA_UPLOAD_MAX_MEMORY_SIZE'] = settings.DATA_UPLOAD_MAX_MEMORY_SIZE
    return render(request, "edit.html", context)