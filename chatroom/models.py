from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.dispatch.dispatcher import receiver
from django.db.models.signals import post_save

class BlockList(models.Model):
    '''
    Provide a blocklist to allow user to automatically remove blocked users messages and status
    Blocked user can still message user but user will not receive any meessage, effectively ghosting the blocked user
    '''
    user        = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    blocklist   = models.ManyToManyField(User, blank=True, related_name="block")

    class Meta:
        verbose_name = ('Block List')
        verbose_name_plural = ('Block List')

    def __str__(self):
        return f'{self.user.username} blocklist'
    
    @property
    def user__username(self):
        return self.user.username

@receiver(post_save, sender=User)
def init_profile(sender, instance, created, **kwargs):
    '''
    Signal when a post is received
    Automatically create a blocklist object(DB) and set user
    '''
    if created:
        BlockList.objects.create(user=instance)