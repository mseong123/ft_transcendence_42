from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user')
    friends = models.ManyToManyField(User, blank=True, related_name="friends")

    def __str__(self):
        return self.user.username


class FriendRequest(models.Model):
    sender 				= models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender")
    receiver 			= models.ForeignKey(User, on_delete=models.CASCADE, related_name="receiver")
    is_active			= models.BooleanField(blank=False, null=False, default=True)
    timestamp 			= models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sender.username
