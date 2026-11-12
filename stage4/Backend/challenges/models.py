from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from matches.models import Sport


# A goal players can join, like "Play 5 football matches in November"
class Challenge(models.Model):
    class GoalType(models.TextChoices):
        PLAY = 'play', 'Play matches'
        WIN = 'win', 'Win matches'

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    goal_type = models.CharField(max_length=10, choices=GoalType.choices, default=GoalType.PLAY)
    target = models.PositiveIntegerField(validators=[MinValueValidator(1)])  # e.g. 5 matches
    # empty sport means any sport counts
    sport = models.ForeignKey(Sport, on_delete=models.SET_NULL, null=True, blank=True, related_name='challenges')
    start_date = models.DateField()
    end_date = models.DateField()
    badge_name = models.CharField(max_length=50)
    players = models.ManyToManyField(settings.AUTH_USER_MODEL, through='ChallengeEntry', related_name='challenges')

    class Meta:
        db_table = 'challenges'
        ordering = ['start_date', 'id']
        constraints = [
            models.CheckConstraint(condition=Q(target__gt=0), name='challenge_target_gt_0'),
            models.CheckConstraint(condition=Q(end_date__gte=models.F('start_date')), name='challenge_end_after_start'),
        ]

    def __str__(self):
        return self.title


# One player inside one challenge
class ChallengeEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenge_entries')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='entries')
    joined_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)  # set when they reach the target

    class Meta:
        db_table = 'challenge_entries'
        constraints = [
            models.UniqueConstraint(fields=['user', 'challenge'], name='unique_user_per_challenge'),
        ]

    def __str__(self):
        return f'{self.user} in {self.challenge}'
