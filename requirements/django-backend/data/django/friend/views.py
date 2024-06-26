from django.contrib.auth.models import User

from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated

from authentication.authentication import CookieJWTAuthentication

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
        '''
        updated but not tested
        didn't implement checking if request gets an active request and rejects it
        '''
        try:
            if request.user.username != request.data['sender']:
                return Response({'detail': 'You cannot send a friend request for someone else.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if request.user.username == request.data['receiver']:
                return Response({'detail': 'you cannot send a friend request to yourself.'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.get(username=request.data['sender'])

            receiver = User.objects.get(username=request.data['receiver'])
            userFriendList = FriendList.objects.get(user=user)
            is_friend = userFriendList.friends.filter(id=receiver.id).exists()
            if is_friend:
                return Response({'detail': 'You cannot send a friend request to someone who is already your friend.'}, status=status.HTTP_400_BAD_REQUEST)

            friendRequestObj, created = FriendRequest.objects.get_or_create(sender=user, receiver=receiver)
            if not created:
                friendRequestObj.is_active = True
            friendRequestObj.save()
            return Response(self.serializer_class(friendRequestObj).data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'User does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        except FriendList.DoesNotExist:
            return Response({'detail': 'Friend list not found.'}, status=status.HTTP_400_BAD_REQUEST)

        
@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def accept_request(request):
    '''updated but not tested'''
    user = request.user
    senderUsername = request.data.get('sender_username')
    if not senderUsername:
        return Response({'detail': 'Please provide a sender_username.'}, status=status.HTTP_400_BAD_REQUEST)
    print(request.data)
    try:
        instance = FriendRequest.objects.get(sender__username=senderUsername, receiver__username=user.username)
        if not instance.is_active:
            return Response({'detail': 'Cannot accept a non-active friend request.'}, status=status.HTTP_400_BAD_REQUEST)
        receiverFriendList = FriendList.objects.get(user=user.id)
        senderFriendList = FriendList.objects.get(user=instance.sender.id)
        if receiverFriendList.friends.filter(id=instance.sender.id).exists() or senderFriendList.friends.filter(id=user.id).exists():
            return Response({'detail': 'You cannot accept a friend request from a friend.'}, status=status.HTTP_400_BAD_REQUEST)
        if FriendRequest.objects.filter(sender=instance.receiver, receiver=instance.sender, is_active=True).exists():
            tmp = FriendRequest.objects.get(sender=instance.receiver, receiver=instance.sender, is_active=True)
            tmp.is_active = False
            tmp.save()
        receiverFriendList.friends.add(instance.sender)
        senderFriendList.friends.add(instance.receiver)
        instance.is_active = False
        receiverFriendList.save()
        senderFriendList.save()
        instance.save()
        return Response(FriendRequestSerializer(instance).data, status=status.HTTP_200_OK)
    except FriendRequest.DoesNotExist:
        return Response({'detail': 'Friend request does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
    except FriendList.DoesNotExist:
        return Response({'detail': 'FriendList does not exist'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def cancel_or_decline(request):
    '''tested decline and cancel'''
    senderUsername = request.data.get('sender_username')
    receiverUsername = request.data.get('receiver_username')
    method = str(request.path).split('/')[-2]
    if (not senderUsername) or (not method) or (not receiverUsername):
        return Response({'detail': 'sender_username or request_method was not provided.'}, status=status.HTTP_400_BAD_REQUEST)
    if method != 'cancel' and method != 'decline':
        return Response({'detail': 'Invalid request_method.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        f_request = FriendRequest.objects.get(sender__username=senderUsername, receiver__username=receiverUsername)
    except FriendRequest.DoesNotExist:
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


@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def unfriend(request):
    friend = request.data.get('friend_username')
    if not friend:
        return Response({"detail": "friend_username was not provided."}, status=status.HTTP_400_BAD_REQUEST)
    if friend == request.user.username:
        return Response({'detail': 'You cannot unfriend yourself.'}, status=status.HTTP_400_BAD_REQUEST)
    try :
        friendUsr = User.objects.get(username=friend)
        user = User.objects.get(username=request.user.username)
        userFriendList = FriendList.objects.get(user=request.user)
        friendFriendList = FriendList.objects.get(user=friendUsr)
        userFriendList.friends.remove(friendUsr)
        friendFriendList.friends.remove(user)
        userFriendList.save()
        friendFriendList.save()
        return Response({'detail': 'Successfully unfriended.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'detail': "User does not exist."}, status=status.HTTP_400_BAD_REQUEST)
    except FriendList.DoesNotExist:
        return Response({'detail': 'FriendList cannot be found.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def outgoing_friendrequest(request):
    try:
        queryset = FriendRequest.objects.filter(sender=request.user.id)
        return Response(FriendRequestSerializer(queryset, many=True).data, status=status.HTTP_200_OK)
    except FriendRequest.DoesNotExist:
        return Response({"detail": "Friend Request does not exist."}, status=status.HTTP_400_BAD_REQUEST)
