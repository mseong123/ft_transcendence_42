from rest_framework import permissions
from django.contrib.auth.models import User

class IsOwnerStaffEditOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """
    def has_permission(self, request, view):
        if(view.action == 'create' and not request.user.is_staff):
            return False
        elif(view.action == 'list' and not request.user.is_staff):
            return False
        return True
        # return request.user == view.get_object().user or  request.user.is_staff
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        # if request.method in permissions.SAFE_METHODS:
        #     return True
        # Instance must have an attribute named `user`.
        try:
            return str(obj.user) == str(request.user) or request.user.is_staff
        except AttributeError:
            return str(obj.username) == str(request.user) or request.user.is_staff
            
class IsOwner(permissions.BasePermission):
    """
    Request-level permission to only allow owners of an object to view and edit it.
    Assumes the model instance has an `owner` attribute.
    """
    def has_permission(self, request, view):
        return request.user == User.objects.get(username=request.user)

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        print("view: ", view.action)
        if (view.action == 'list'):
            return False
        elif request.method in permissions.SAFE_METHODS:
            return True
        # Instance must have an attribute named `owner`.
        return obj.user == request.user
    
class IsAdminUserOrReadOnly(permissions.IsAdminUser):

    def has_permission(self, request, view):
        is_admin = super(
            IsAdminUserOrReadOnly, 
            self).has_permission(request, view)
        # Python3: is_admin = super().has_permission(request, view)
        return request.method in permissions.SAFE_METHODS or is_admin