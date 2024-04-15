from django.shortcuts import render
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets, status, mixins, generics
from .serializers import BlockListSerializer
from .models import BlockList
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated, IsAdminUser
from rest_framework.response import Response

# Create your views here.
class BlockListViewSet(mixins.UpdateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
# class BlockListViewSet(viewsets.ModelViewSet):
    queryset = BlockList.objects.all().select_related('user')
    serializer_class = BlockListSerializer
    lookup_field = 'user__username'

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(BlockListViewSet, self).get_permissions()

    def get_queryset(self):
        """
        This view should return a list of block users
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_staff:
            return BlockList.objects.all()
        return BlockList.objects.filter(user=user)
  
    def put(self, request, *args, **kwargs): 
        return self.update(request, *args, **kwargs) 
    
    # def update(self, request, *args, **kwargs):
    #     print("self:", self)
    #     print("request:", request)
    #     print("args:", args)
    #     partial = kwargs.pop('partial', False)
    #     print("partial:", partial)
    #     instance = self.get_object()
    #     print("instance:", instance)
    #     serializer = self.get_serializer(instance, data=request.data, partial=partial)
    #     print("serializer:", serializer)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)

    #     if getattr(instance, '_prefetched_objects_cache', None):
    #         # If 'prefetch_related' has been applied to a queryset, we need to
    #         # forcibly invalidate the prefetch cache on the instance.
    #         instance._prefetched_objects_cache = {}

    #     return Response(serializer.data)

  