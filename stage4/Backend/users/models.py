from django.conf import settings
from django.db import models


# Django's built-in User already stores name (first_name), username, email and the hashed password.
# Profile adds the extra field from our design.
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.URLField(max_length=500, blank=True)

    class Meta:
        db_table = 'profiles'

    def __str__(self):
        return f'Profile of {self.user.username}'
