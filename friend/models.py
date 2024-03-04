from django.db import models

# Create your models here.
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User

class FriendList(models.Model):
    user    = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user")
    friends = models.ManyToManyField(User, blank=True, related_name="friends")
    
    def __str__(self) -> str:
        return self.user.username
    
    def add_friend(self, user):
        '''
        Add a new friend
        '''
        if not user in self.friends.all():
            self.friends.add(user)
            # self.save()

    def remove_friend(self, user):
        if user in self.friends.all():
            self.friends.remove(user)

    def unfriend(self, removee):
        '''
        Initiate process of unfriending someone
        '''
        remover = self
        remover.remove_friend(removee)
        not_friend = FriendList.objects.get(user=removee)
        not_friend.remove_friend(self.user)

    def is_friend(self,friend):
        '''
        Check if is friend
        '''
        if friend in self.friends.all():
            return True
        return False
    
class FriendRequest(models.Model):
    sender      = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender")
    receiver    = models.ForeignKey(User, on_delete=models.CASCADE, related_name="receiver")
    is_active   = models.BooleanField(blank=True, null=False, defailt=True)
    timestamp   = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.sender.username
    
    def accept(self):
        receiver_friend_list    = FriendList.objects.get(user=self.receiver)
        if receiver_friend_list:
            receiver_friend_list.add_friend(self.sender)
            sender_friend_list  = FriendList.objects.get(user=self.sender)
            if sender_friend_list:
                sender_friend_list.add_friend(self.receiver)
                self.is_active = False