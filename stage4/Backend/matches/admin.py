from django.contrib import admin

from .models import Invitation, Match, Participation, Sport


@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'sport', 'creator', 'date', 'time', 'location', 'max_players', 'total_cost', 'status')
    list_filter = ('sport', 'status', 'date')
    search_fields = ('location', 'creator__username')


@admin.register(Participation)
class ParticipationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'match', 'status', 'payment_amount', 'payment_status')
    list_filter = ('status', 'payment_status')


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'match', 'status')
    list_filter = ('status',)
