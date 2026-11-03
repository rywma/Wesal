from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Invitation, Match, Participation, Sport


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


class PaymentStatusSerializer(serializers.ModelSerializer):
    # one player's share and payment status in a match
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.CharField(source='user.first_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Participation
        fields = ['user_id', 'name', 'email', 'payment_amount', 'payment_status']
        read_only_fields = ['payment_amount']


class CreatorProfileSerializer(serializers.ModelSerializer):
    # the host's public info (no email, anyone can open a match)
    name = serializers.CharField(source='first_name', read_only=True)

    class Meta:
        model = get_user_model()
        fields = ['id', 'name']


class ParticipantSerializer(serializers.ModelSerializer):
    # one player in the match details, with their payment badge
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Participation
        fields = ['user_id', 'name', 'payment_amount', 'payment_status']


class MatchDetailSerializer(MatchSerializer):
    creator = CreatorProfileSerializer(read_only=True)
    participants = serializers.SerializerMethodField()

    class Meta(MatchSerializer.Meta):
        fields = MatchSerializer.Meta.fields + ['participants']

    def get_participants(self, match):
        # only players still in the match, not the ones who left
        players = match.participations.filter(status=Participation.Status.JOINED).select_related('user')
        return ParticipantSerializer(players, many=True).data


class InvitationSerializer(serializers.ModelSerializer):
    # one invitation, with who sent it and the match it's for
    sender = serializers.CharField(source='sender.first_name', read_only=True)
    match = MatchSerializer(read_only=True)

    class Meta:
        model = Invitation
        fields = ['id', 'sender', 'match', 'status']
