from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.dispatch.dispatcher import receiver
from django.db.models.signals import post_save
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.conf import settings
import os

def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    # print("url:", instance.image.url)
    # print("path:", instance.image.path)
    # img_path = '{0}/{1}/profile_pic.png'.format(settings.MEDIA_ROOT, instance.user.username)
    # print("Image_path: ", img_path)
    # if os.path.isfile(img_path):
        # print("There's a file")
    #     os.remove(img_path)
    # print("user_directory_path: instance:", instance, "instance.pk:", instance.pk, "instance.user.pk:",instance.user.pk)
    ext = instance.extension()
    # file_upload_dir = os.path.join(settings.MEDIA_ROOT, instance.user.username)
    # ext = instance.extension()
    # if os.path.exists(file_upload_dir):
    #     import shutil
    #     shutil.rmtree(file_upload_dir)
    # return os.path.join(file_upload_dir, filename, ext)
    return '{0}/{1}{2}'.format(instance.user.username, "profile_pic", ext)

# def user_name(instance):
#     # get instance username
#     return '{0}'.format(instance.user.username)

class Profile(models.Model):
    '''
    Profile model to keep user profile data extend the account db
    user: requires a User from allauth account tobe chosen and set as primary key
    one-to-one model simplified means only one Profile can be tied to one User
    image: to set the profile image
    is_online: use to verify if person is online
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True) # on_delete=models.CASCADE Delete profile when user is deleted
    image = models.ImageField(default='default.jpg', upload_to=user_directory_path)
    is_online = models.BooleanField(default=False)
    nick_name = models.CharField(max_length=20, blank=True)
    hide_email = models.BooleanField(default=False)

    # def save(self, *args, **kwargs):
    #     if self.nick_name is None:
    #         self.nick_name = self.user.username
    #     super(Profile,self).save(*args,**kwargs)

    def __str__(self):
        return f'{self.user.username} Profile' #show how we want it to be display

    def extension(self):
        name, extension = os.path.splitext(self.image.name)
        return extension
    
@receiver(post_save, sender=User)
def init_profile(sender, instance, created, **kwargs):
    '''
    Signal when a post is received
    Automatically create a profile object(DB) and set user
    '''
    print(sender, instance, created)
    if created:
        Profile.objects.create(user=instance, nick_name=instance)
    
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    '''
    Signal when a login happens
    Automatically update is_online field to True
    '''
    # print(user, sender, request)
    Profile.objects.all().filter(user=user).update(is_online=True)

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    '''
    Signal when a login happens
    Automatically update is_online field to False
    '''
    Profile.objects.all().filter(user=user).update(is_online=False)