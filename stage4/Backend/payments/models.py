from django.core.validators import MinValueValidator
from django.db import models

from matches.models import Participation


# One participation can have several payment attempts (Moyasar test mode)
class Payment(models.Model):
    class Status(models.TextChoices):
        INITIATED = 'initiated', 'Initiated'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'

    participation = models.ForeignKey(Participation, on_delete=models.CASCADE, related_name='payments')
    moyasar_payment_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.moyasar_payment_id} ({self.status})'
