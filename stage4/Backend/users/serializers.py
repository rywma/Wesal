import re

from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'email', 'username', 'full_name', 'bio', 
            'skill_level', 'favorite_sports', 'avatar_url', 
            'background_url', 'points', 'profile_image'
        ]
        read_only_fields = ['id', 'email', 'points']
        extra_kwargs = {'username': {'validators': []}}

    def validate_username(self, value):
        if not value:
            return None
        value = value.strip().lower()
        if not re.fullmatch(r'[a-z0-9_]{3,20}', value):
            raise serializers.ValidationError('Use 3 to 20 letters, numbers or _.')

        taken = Profile.objects.filter(username=value)
        if self.instance:
            taken = taken.exclude(pk=self.instance.pk)
        if taken.exists():
            raise serializers.ValidationError('This username is already taken.')
        return value