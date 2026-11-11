from django.contrib import admin

from .models import Challenge, ChallengeEntry


# challenges are created here by the admin, players can only join them
@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'goal_type', 'target', 'sport', 'start_date', 'end_date', 'badge_name')
    list_filter = ('goal_type', 'sport')
    search_fields = ('title', 'badge_name')


@admin.register(ChallengeEntry)
class ChallengeEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'challenge', 'joined_at', 'completed_at')
    list_filter = ('challenge',)
