from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Sport(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'sports'
        ordering = ['name']

    def __str__(self):
        return self.name


class Match(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        FULL = 'full', 'Full'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'

    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_matches')
    sport = models.ForeignKey(Sport, on_delete=models.PROTECT, related_name='matches')
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255)
    max_players = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    total_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    players = models.ManyToManyField(settings.AUTH_USER_MODEL, through='Participation', related_name='joined_matches')

    class Meta:
        db_table = 'matches'
        ordering = ['date', 'time']
        constraints = [
            models.CheckConstraint(condition=models.Q(max_players__gt=0), name='match_max_players_gt_0'),
            models.CheckConstraint(condition=models.Q(total_cost__gte=0), name='match_total_cost_gte_0'),
        ]

    def __str__(self):
        return f'{self.sport} at {self.location} on {self.date}'


class Participation(models.Model):
    class Status(models.TextChoices):
        JOINED = 'joined', 'Joined'
        LEFT = 'left', 'Left'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='participations')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='participations')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.JOINED)
    payment_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)

    class Meta:
        db_table = 'participations'
        constraints = [
            models.UniqueConstraint(fields=['user', 'match'], name='unique_user_per_match'),
        ]

    def __str__(self):
        return f'{self.user} in {self.match}'


class Invitation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_invitations')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_invitations')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='invitations')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    class Meta:
        db_table = 'invitations'
        constraints = [
            models.UniqueConstraint(fields=['receiver', 'match'], name='unique_invitation_per_match'),
        ]

    def __str__(self):
        return f'{self.sender} invited {self.receiver} to {self.match}'
