from django.db import models
from django.dispatch.dispatcher import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User

# Create your models here.
class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user')
    friends = models.ManyToManyField(User, blank=True, related_name="friends")

    def __str__(self):
        return self.user.username


@receiver(post_save, sender=User)
def init_profile(sender, instance, created, **kwargs):
    if created:
        FriendList.objects.create(user=instance)


class FriendRequest(models.Model):
    sender 				= models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender")
    receiver 			= models.ForeignKey(User, on_delete=models.CASCADE, related_name="receiver")
    is_active			= models.BooleanField(blank=False, null=False, default=True)
    timestamp 			= models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sender.username
    
    @property
    def sender__username(self):
        return self.sender.username
    
