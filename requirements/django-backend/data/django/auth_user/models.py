from django.db import models
from django.contrib.auth.models import User

class AuthUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    otp = models.CharField(max_length=6, blank=True)
    otp_expiry_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.user.username
