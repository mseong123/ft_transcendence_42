# Create your views here.
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from friend.models import FriendList, FriendRequest
from friend.serializers import FriendListSerializer, FriendRequestSerializer

class FriendListViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = FriendList.objects.all()
    serializer_class = FriendListSerializer
    lookup_field = 'user__username'

    def list(self, request):
        queryset = FriendList.objects.get(user=(request.user))
        serialized = self.serializer_class(queryset)
        tmp_instance = serialized.data
        for i in range(len(tmp_instance["friends"])):
            try:
                tmp_instance["friends"][i] = User.objects.get(pk=int(tmp_instance["friends"][i])).username
            except User.DoesNotExist:
                tmp_instance["friends"][i] = "Does not exist"
        return Response(tmp_instance)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return FriendList.objects.all()
        return FriendList.objects.get(user=user)


class FriendRequestViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = FriendRequest.objects.all().select_related('sender')
    serializer_class = FriendRequestSerializer


    def list(self, request):
        '''updated'''
        queryset = FriendRequest.objects.filter(receiver=(request.user), is_active=True)
        serialized = self.serializer_class(queryset, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        '''updated but not tested'''
        user = request.user
        instance = None

        try:
            tmp_list = FriendList.objects.get(user=user.id)
        except FriendList.DoesNotExist:
            return Response({'detail': 'Friendlist does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            receiver = User.objects.get(username=request.data.get('receiver'))
        except User.DoesNotExist:
            return Response({'detail': 'User does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        
        tmp = tmp_list.friends.filter(id=receiver.id)
        if tmp.exists():
            return Response({'detail': 'You cannot send a friend request to a friend.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.data['sender'] == user.username:
            if receiver.id != user.id:
                tmp_instance = FriendRequest.objects.filter(sender=user.id, receiver=receiver.id).exists()
                if not tmp_instance:
                    instance = FriendRequestSerializer(data=request.data)
                else:
                    tmp_instance = FriendRequest.objects.get(sender=user.id, receiver=receiver.id)
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
    '''updated tested main not all errors'''
    user = request.user
    senderUsername = request.data.get('sender_username')
    if not senderUsername:
        return Response({'detail': 'Please provide a sender_username.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        instance = FriendRequest.objects.get(sender__username=senderUsername, receiver__username=user.username)
    except FriendRequest.DoesNotExist:
        return Response({'detail': 'Friend request does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not instance.is_active:
        return Response({'detail': 'Cannot accept a non-active friend request.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if instance.receiver.id == user.id:
        try:
            user_friend_list = FriendList.objects.get(user=user.id)
            new_friend_friend_list = FriendList.objects.get(user=instance.sender.id)
        except FriendList.DoesNotExist: 
            return Response({'detail': 'FriendList not found.'}, status=status.HTTP_400_BAD_REQUEST)
        if (not user_friend_list.friends.filter(id=instance.sender.id).exists()) and (not new_friend_friend_list.friends.filter(id=user.id).exists()):
            new_friend_friend_list.friends.add(instance.receiver)
            user_friend_list.friends.add(instance.sender)
            instance.is_active = False
            user_friend_list.save()
            new_friend_friend_list.save()
            instance.save()
            s_instance = FriendListSerializer(user_friend_list)
            # s_instance.data['sender'] = instance.sender.username
            # s_instance.data['receiver'] = instance.receiver.username
            return Response(s_instance.data, status=status.HTTP_200_OK)
        instance.is_active = False
        instance.save()
        return Response({'details': 'You cannot accept a friend request from a friend.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'detail': "Error: You either are trying to accept another persons friend request or you are not authenticated."}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=FriendRequestSerializer,
    responses=None
)
@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_or_decline(request):
    '''tested decline and cancel'''
    r_id = request.data.get('sender_username')
    method = str(request.path).split('/')[-2]
    if (not r_id) or (not method):
        return Response({'detail': 'sender_username or request_method was not provided.'}, status=status.HTTP_400_BAD_REQUEST)
    if method != 'cancel' and method != 'decline':
        return Response({'detail': 'Invalid request_method.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        f_request = FriendRequest.objects.get(sender__username=r_id)
    except FriendList.DoesNotExist:
        return Response({'detail': 'Friend request not found.'}, status=status.HTTP_400_BAD_REQUEST)

    if f_request.is_active == False:
        return Response({'detail': f'You cannot {method} a non active friend request.'}, status=status.HTTP_400_BAD_REQUEST)

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


@extend_schema(
    request=FriendListSerializer,
    responses=None
)
@api_view(['POST'])
@permission_classes([AllowAny])
def is_friend(request):
    friendUsername = request.data.get('friend')
    if not friendUsername:
        return Response({'detail': 'Friend Username is not provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # getting friend user
    try:
        friendUser = User.objects.get(username=friendUsername)
    except User.DoesNotExist:
        return Response({'detail': 'User does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # getting friendlist
    try:
        userFriendList = FriendList.objects.get(user=request.user.id)
    except FriendList.DoesNotExist:
        return Response({'detail': 'Friend list does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

    if userFriendList.friends.filter(id=friendUser.id).exists():
        return Response({'is_friend': 1}, status=status.HTTP_200_OK)
    return Response({'is_friend': 0}, status=status.HTTP_200_OK)



# THINGS NEED TO DO IN THIS FILE
# customized the response for the schema