from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'moyasar_payment_id', 'participation', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('moyasar_payment_id',)
