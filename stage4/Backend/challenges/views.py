from datetime import date

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from matches.models import Match, Participation
from .models import Challenge, ChallengeEntry


# counts the user's qualifying matches inside the challenge dates
def challenge_progress(challenge, user):
    # only days that already happened count, so a future match isn't "played" yet
    last_day = min(challenge.end_date, date.today())
    matches = Match.objects.filter(date__gte=challenge.start_date, date__lte=last_day)
    if challenge.sport_id:
        matches = matches.filter(sport_id=challenge.sport_id)

    if challenge.goal_type == Challenge.GoalType.WIN:
        matches = matches.filter(status=Match.Status.COMPLETED, winner=user)
    else:
        # played = the user was still in the match and it wasn't cancelled
        matches = matches.filter(
            status__in=[Match.Status.OPEN, Match.Status.FULL, Match.Status.COMPLETED],
            participations__user=user,
            participations__status=Participation.Status.JOINED,
        )
    return matches.distinct().count()


# works out the progress and marks the entry completed the first time the target is reached
def update_entry(entry):
    progress = challenge_progress(entry.challenge, entry.user)
    if progress >= entry.challenge.target and not entry.completed_at:
        entry.completed_at = timezone.now()
        entry.save(update_fields=['completed_at'])
    return progress


def challenge_data(challenge):
    return {
        'id': challenge.id,
        'title': challenge.title,
        'description': challenge.description,
        'goal_type': challenge.goal_type,
        'target': challenge.target,
        'sport': challenge.sport.name if challenge.sport else None,
        'start_date': challenge.start_date,
        'end_date': challenge.end_date,
        'badge_name': challenge.badge_name,
        'is_active': challenge.start_date <= date.today() <= challenge.end_date,
        'players_count': challenge.entries.count(),
    }


# the logged in user's progress in one challenge
def my_progress(challenge, user):
    entry = challenge.entries.filter(user=user).first()
    if not entry:
        return {'joined': False, 'progress': None, 'percent': None, 'completed': False}
    progress = update_entry(entry)
    return {
        'joined': True,
        'progress': progress,
        'percent': min(100, round(progress * 100 / challenge.target)),
        'completed': entry.completed_at is not None,
    }


# List challenges, each with my progress
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def challenge_list(request):
    challenges = Challenge.objects.select_related('sport')
    return Response([{**challenge_data(c), **my_progress(c, request.user)} for c in challenges])


# One challenge, with a leaderboard of everyone in it sorted by progress
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def challenge_detail(request, challenge_id):
    challenge = get_object_or_404(Challenge.objects.select_related('sport'), pk=challenge_id)

    rows = []
    for entry in challenge.entries.select_related('user', 'challenge'):
        progress = update_entry(entry)
        rows.append({
            'user_id': entry.user_id,
            'name': entry.user.first_name,
            'is_me': entry.user_id == request.user.id,
            'progress': progress,
            'completed': entry.completed_at is not None,
            'completed_at': entry.completed_at,
        })

    # most progress first; if tied, whoever finished first wins
    rows.sort(key=lambda row: (-row['progress'], row['completed_at'] or timezone.now()))
    for rank, row in enumerate(rows, start=1):
        row['rank'] = rank

    return Response({**challenge_data(challenge), **my_progress(challenge, request.user), 'leaderboard': rows})


# Join a challenge
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_challenge(request, challenge_id):
    challenge = get_object_or_404(Challenge, pk=challenge_id)
    if challenge.end_date < date.today():
        return Response({'error': 'This challenge has ended.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ChallengeEntry.objects.create(user=request.user, challenge=challenge)
    except IntegrityError:
        # the unique rule also stops two joins sent at the same moment
        return Response({'error': 'You already joined this challenge.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({**challenge_data(challenge), **my_progress(challenge, request.user)},
                    status=status.HTTP_201_CREATED)


# Leave a challenge (a finished challenge keeps its badge, so it can't be left)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_challenge(request, challenge_id):
    challenge = get_object_or_404(Challenge, pk=challenge_id)
    entry = challenge.entries.filter(user=request.user).first()
    if not entry:
        return Response({'error': 'You are not in this challenge.'}, status=status.HTTP_400_BAD_REQUEST)

    update_entry(entry)
    if entry.completed_at:
        return Response({'error': 'You already completed this challenge.'}, status=status.HTTP_400_BAD_REQUEST)

    entry.delete()
    return Response({'message': 'You left the challenge.'}, status=status.HTTP_200_OK)


# My badges: every challenge I completed
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_badges(request):
    entries = ChallengeEntry.objects.filter(user=request.user).select_related('challenge', 'user')
    badges = []
    for entry in entries:
        update_entry(entry)
        if entry.completed_at:
            badges.append({
                'challenge_id': entry.challenge_id,
                'challenge': entry.challenge.title,
                'badge_name': entry.challenge.badge_name,
                'completed_at': entry.completed_at,
            })
    badges.sort(key=lambda badge: badge['completed_at'])
    return Response(badges)
