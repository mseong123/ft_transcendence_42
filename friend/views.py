from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets, mixins 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from friend.models import FriendList, FriendRequest
from friend.serializers import FriendListSerializer, FriendRequestSerializer

# Create your views here.

class testClass(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):

    queryset = FriendList.objects.all().select_related('user')
    authentication_classes = [SessionAuthentication]
    serializer_class = FriendListSerializer

    def get_permissions(self):
        # if self.request.method == 'GET':
        self.permission_classes = [IsAuthenticated]
        return super(testClass, self).get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return FriendList.objects.all()
        return FriendList.objects.filter(user=user)


    # @api_view(['GET'])
    # @permission_classes([AllowAny])
    # def testResponse(request):
    #     return HttpResponse("HAH IT WORKS")