from django.shortcuts import render

# Create your views here.
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
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


    def list(self, request):
        queryset = FriendRequest.objects.filter(receiver=(request.user))
        serialized = self.serializer_class(queryset, many=True)
        # if not serialized.data:00
            # return Response({'detail': 'No friend request found'})
        return Response(serialized.data, status=status.HTTP_200_OK)


    def create(self, request, *args, **kwargs):
        user = request.user
        instance = None

        try:
            tmp_list = FriendList.objects.get(user=user.id)
            tmp = tmp_list.friends.filter(id=request.data['receiver'])
            if tmp.exists():
                return Response({'detail': 'You cannot send a friend request to a friend.'}, status=status.HTTP_400_BAD_REQUEST)
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
                    if tmp_instance.is_active == True:
                        return Response({'detail': 'This friend is already active and is pending the other users acceptance.'}, status=status.HTTP_400_BAD_REQUEST)
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
        return Response({'detail': 'Please provide a request_id.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        instance = FriendRequest.objects.get(pk=pk)
    except FriendRequest.DoesNotExist:
        return Response({'detail': 'Friend request does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not instance.is_active:
        return Response({'detail': 'Cannot accept a non-active friend request.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if instance.receiver.id == request.user.id:
        try:
            user_friend_list = FriendList.objects.get(user=request.user.id)
            new_friend_friend_list = FriendList.objects.get(user=instance.sender.id)
        except FriendList.DoesNotExist: 
            return Response({'detail': 'FriendList not found.'}, status=status.HTTP_400_BAD_REQUEST)
        if (not user_friend_list.friends.filter(id=instance.sender.id).exists()) and (not new_friend_friend_list.friends.filter(id=request.user.id).exists()):
            new_friend_friend_list.friends.add(instance.receiver)
            user_friend_list.friends.add(instance.sender)
            instance.is_active = False
            user_friend_list.save()
            new_friend_friend_list.save()
            instance.save()
            s_instance = FriendListSerializer(user_friend_list)
            return Response(s_instance.data, status=status.HTTP_200_OK)
        return Response({'details': 'You cannot accept a friend request from a friend.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'detail': "Error: You either are trying to accept another persons friend request or you are not authenticated."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_or_decline(request):
    r_id = request.data.get('request_id')
    method = str(request.path).split('/')[-2]
    if (not r_id) or (not method):
        return Response({'detail': 'request_id or request_method was not provided.'}, status=status.HTTP_400_BAD_REQUEST)
    if method != 'cancel' and method != 'decline':
        return Response({'detail': 'Invalid request_method.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        f_request = FriendRequest.objects.get(pk=r_id)
    except FriendList.DoesNotExist:
        return Response({'detail': 'Friend request not found.'}, status=status.HTTP_400_BAD_REQUEST)

    if f_request.is_active == False:
        return Response({'detail': f'You cannot {method} a non active friend request.'}, status=status.HTTP_400_BAD_REQUEST)

    # print(type(f_request.sender.id), type(request.user.id)) # DE
    # print(f_request.sender.id, request.user.id)
    # print(type(f_request.sender.id), type(request.user.id))
    # print(f_request.receiver.id, request.user.id)
    if method == 'cancel' and f_request.sender.id == request.user.id:
        f_request.is_active = False
        f_request.save()
        return Response({'detail': 'Successfully canceled friend request.'}, status=status.HTTP_200_OK)
    elif method == 'decline' and f_request.receiver.id == request.user.id:
        f_request.is_active = False
        f_request.save()
        return Response({'detail': 'Successfully declined friend request.'}, status=status.HTTP_200_OK)
    return Response({'detail': f"Unable to {method} friend request. this is due to you not being authenticated or the friend request id you've entered doesn't belong to you."}, status=status.HTTP_400_BAD_REQUEST)




@extend_schema(
    request=FriendListSerializer,
    responses=None
)
@api_view(['POST'])
@permission_classes([AllowAny])
def unfriend(request):
    usr = request.data.get('user_id')
    friend = request.data.get('friend_id')
    if (not usr) or (not friend):
        return Response({'detail': 'User or friend id not provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if int(usr) != request.user.id:
        return Response({'detail': "Error: You are either trying to unfriend someone else's friend or you are not authenticated."}, status=status.HTTP_400_BAD_REQUEST)
    
    if int(usr) == int(friend):
        return Response({'detail': 'You cannot unfriend yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        usr_friend_list = FriendList.objects.get(user=usr)
        friend_friend_list = FriendList.objects.get(user=friend)
    except FriendList.DoesNotExist:
        return Response({'detail': 'FriendList not found.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        friend = User.objects.get(pk=friend)
        usr = User.objects.get(pk=usr)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)

    print(friend, usr)
    usr_friend_list.friends.remove(friend)
    friend_friend_list.friends.remove(usr)
    usr_friend_list.save()
    friend_friend_list.save()
    return Response({'detail': 'Successfully unfriended.'}, status=status.HTTP_200_OK)


# NEW PROBLEM HOW DO YOU SHOW THE USER THE LIST OF FRIEND REQUEST FROM THE BACKEND TO THE FRONT END
# # solution
# merge main branch with this branch
# fix merge conflicts
# create friend.js
# import global, import refreshFetch