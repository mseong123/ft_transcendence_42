from django.shortcuts import render

# Create your views here.
from django.contrib.auth.models import User
from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
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

        try:
            tmp_list = FriendList.objects.get(user=user.id)
            tmp = tmp_list.friends.filter(id=receiver.data['receiver'])
            print(tmp.exists())
            if tmp.exists():
                return Response({'detail': 'You cannot send a friend request to a friend.'})
        except FriendList.DoesNotExist:
            return Response({'detail': 'Friendlist does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

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


@extend_schema(
    request=FriendRequestSerializer,
    responses=None
)
@api_view(['POST'])
@permission_classes([AllowAny])
def accept_request(request):

    pk = request.data.get('request_id')
    if not pk:
        return Response({'detail': 'Please provide a request_id'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        instance = FriendRequest.objects.get(pk=pk)
    except FriendRequest.DoesNotExist:
        return Response({'detail': 'Friend request does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not instance.is_active:
        return Response({'detail': 'Cannot accept a non-active friend request'}, status=status.HTTP_400_BAD_REQUEST)
    
    if instance.receiver.id == request.user.id:
        try:
            user_friend_list = FriendList.objects.get(user=request.user.id)
            new_friend_friend_list = FriendList.objects.get(user=instance.sender.id)
            print(new_friend_friend_list.user.username, user_friend_list.user.username)
        except FriendList.DoesNotExist: 
            return Response({'detail': 'FriendList not found.'}, status=status.HTTP_400_BAD_REQUEST)
        if (not user_friend_list.friends.filter(id=instance.sender.id).exists()) and (not new_friend_friend_list.friends.filter(id=request.user.id).exists()):
            user_friend_list.friends.add(instance.receiver)
            new_friend_friend_list.friends.add(instance.sender)
            instance.is_active = False
            user_friend_list.save()
            new_friend_friend_list.save()
            instance.save()
            s_instance = FriendListSerializer(user_friend_list)
            return Response(s_instance.data, status=status.HTTP_200_OK)
        return Response({'details': 'You cannot accept a friend request from a friend.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'detail': "You cannot accept another person's friend request."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def unfriend(request):
    usr = request.data.get('user_id')
    friend = request.data.get('friend_id')
    if (not usr) or (not friend):
        return Response({'detail': 'User or friend id not provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        usr_friend_list = FriendList.objects.get(user=usr)
        friend_friend_list = FriendList.objects.get(user=friend)
    except FriendList.DoesNotExist:
        return Response({'detail': 'FriendList not found.'}, status=status.HTTP_400_BAD_REQUEST)

    usr_friend_list.friends.remove(friend)
    friend_friend_list.friends.remove(usr)
    usr_friend_list.save()
    friend_friend_list.save()
    return Response({'detail': 'Successfully unfriended'}, status=status.HTTP_200_OK)




# use mixins for frindlist 
# use mixins for modifying or creating for friendRquest
