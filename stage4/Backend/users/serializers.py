from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'email', 'username', 'full_name', 'bio', 
            'skill_level', 'favorite_sports', 'avatar_url', 
            'background_url', 'points', 'profile_image'
        ]
        read_only_fields = ['id', 'email', 'username', 'points']