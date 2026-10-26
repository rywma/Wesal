from datetime import date

from rest_framework import serializers

from .models import Match, Sport


class MatchSerializer(serializers.ModelSerializer):
    # the frontend sends sport_id, and gets the sport name back
    sport_id = serializers.PrimaryKeyRelatedField(source='sport', queryset=Sport.objects.all(), write_only=True)
    sport = serializers.StringRelatedField(read_only=True)
    creator = serializers.CharField(source='creator.first_name', read_only=True)
    players_count = serializers.IntegerField(read_only=True)
    spots_left = serializers.IntegerField(read_only=True)
    share_per_player = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = Match
        fields = [
            'id', 'sport_id', 'sport', 'creator', 'date', 'time', 'location',
            'max_players', 'total_cost', 'status', 'players_count', 'spots_left', 'share_per_player',
        ]
        read_only_fields = ['status']

    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError('The match date cannot be in the past.')
        return value
