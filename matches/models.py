from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.dispatch.dispatcher import receiver
from django.db.models.signals import post_save, pre_save
from django.conf import settings
from django.utils import timezone
import os


class Matches(models.Model):
    '''
    Stores all finished matches that are generated/hosted by users
    '''
    t1          = models.ManyToManyField(User, blank=True, related_name="team_one")
    t2          = models.ManyToManyField(User, blank=True, related_name="team_two")
    t1_points   = models.IntegerField(default=0)
    t2_points   = models.IntegerField(default=0)
    # timezone.activate(timezone.get_default_timezone())
    created_on  = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Match"
        verbose_name_plural = "Matches"
        # ordering = "id"

    def __str__(self):
        return f'{self.pk}'

class MatchHistory(models.Model):
    '''
    Stores the users matches
    '''
    user            = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    matches         = models.ManyToManyField(Matches, blank=True, related_name="matches")
    total_matches   = models.IntegerField(default=0)

    class Meta:
        verbose_name = ('Match History')
        verbose_name_plural = ('Match Histories')

    def __str__(self):
        return f'{self.user.username} Matches'
    
    @property
    def user__username(self):
        return self.user.username

@receiver(post_save, sender=User)
def init_profile(sender, instance, created, **kwargs):
    '''
    Signal when a post is received
    Automatically create a match history object(DB) and set user
    '''
    if created:
        MatchHistory.objects.create(user=instance)