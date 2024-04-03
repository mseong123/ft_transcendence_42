from django.shortcuts import render

# Create your views here.
from django.contrib.auth.models import User
from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from drf_spectacular.utils import extend_schema

from friend.models import FriendList, FriendRequest
from friend.serializers import FriendListSerializer, FriendRequestSerializer

class FriendListViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = FriendList.objects.all()
    serializer_class = FriendListSerializer
    lookup_field = 'user__username'

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return FriendList.objects.all()
        return FriendList.objects.get(user=user)


class FriendRequestViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = FriendRequest.objects.all().select_related('sender')
    serializer_class = FriendRequestSerializer

    def create(self, request, *args, **kwargs):
        user = request.user
        instance = None
        if int(request.data['sender']) == user.id:
            receiver = User.objects.get(pk=request.data['receiver'])
            if receiver.id != user.id:
                tmp_instance = FriendRequest.objects.filter(sender=user, receiver=receiver).exists()
                if not tmp_instance:
                    instance = FriendRequestSerializer(data=request.data)
                else:
                    tmp_instance = FriendRequest.objects.get(sender=user, receiver=receiver)
                    instance = FriendRequestSerializer(tmp_instance, data={'is_active': True}, partial=True)
                if instance.is_valid():
                    instance.save()
                    return Response(instance.data, status=status.HTTP_200_OK)
                return Response(instance.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({'details': 'You cannot send a friend request to yourself.'}, status=status.HTTP_400_BAD_REQUEST) 
        return Response({'details': 'You cannot send a friend request for someone else.'}, status=status.HTTP_400_BAD_REQUEST)

    
    



# use mixins for frindlist 
# use mixins for modifying or creating for friendRquest
