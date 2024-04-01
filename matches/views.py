from django.shortcuts import render

# Create your views here.
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets, status, mixins
from matches.serializers import MatchesSerializer, MatchHistorySerializer
from matches.models import Matches, MatchHistory
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action, authentication_classes
from django.contrib.auth.models import User

class MatchHistoryViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = MatchHistory.objects.all().select_related('user')
    serializer_class = MatchHistorySerializer
    lookup_field = 'user__username'

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(MatchHistoryViewSet, self).get_permissions()

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_staff:
            return MatchHistory.objects.all()
        return MatchHistory.objects.filter(user=user)
        return MatchHistory.objects.filter(user=user)

    # @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated,])
    # def get(self, request, *args, **kwargs):
    #     # print(', '.join(['{}={!r}'.format(k, v) for k, v in kwargs.items()]))
    #     user = self.request.user
    #     print("Request user:", user)
    #     look_up = kwargs.get('user__username')
    #     print("Look_up:", look_up)
    #     print("method:", request.method)
    #     response = Response(
    #         {'detail': ('DELETE method will permanently delete account.')},
    #         status=status.HTTP_200_OK,
    #     )

    #     try:
    #         user_object = User.objects.get(username=look_up)
    #         if look_up != str(user):
    #             print('Not current user account.')
    #             response.data = {'detail': ('Not current user account.')}
    #             response.status_code =status.HTTP_401_UNAUTHORIZED
    #             return response
    #     except MatchHistory.DoesNotExist:
    #         response.data = {'detail': ('Account does not exist.')}
    #         response.status_code =status.HTTP_404_NOT_FOUND
    #         return response
    #     matches = user_object.matchhistory.matches.all()
    #     print(matches[0].t1.all())
    #     return response
