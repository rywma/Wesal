from datetime import date

from django.db import migrations

START, END = date(2026, 11, 1), date(2026, 12, 31)

# (title, description, goal type, target, sport name or None for any sport, badge)
STARTER_CHALLENGES = [
    ('First Kickoff', 'Play your first match on Wesal.', 'play', 1, None, 'Rookie'),
    ('Football Fan', 'Play 5 football matches before the end of the year.', 'play', 5, 'Football', 'Football Fan'),
    ('Padel Regular', 'Play 3 padel matches before the end of the year.', 'play', 3, 'Padel', 'Padel Regular'),
    ("Winner's Circle", 'Win 3 matches in any sport.', 'win', 3, None, 'Champion'),
]


# adds a few challenges so the demo has some to show
def add_starter_challenges(apps, schema_editor):
    Challenge = apps.get_model('challenges', 'Challenge')
    Sport = apps.get_model('matches', 'Sport')
    for title, description, goal_type, target, sport_name, badge in STARTER_CHALLENGES:
        sport = Sport.objects.filter(name=sport_name).first() if sport_name else None
        if sport_name and not sport:
            continue  # that sport isn't in this database (e.g. an empty test database)
        Challenge.objects.get_or_create(title=title, defaults={
            'description': description, 'goal_type': goal_type, 'target': target, 'sport': sport,
            'start_date': START, 'end_date': END, 'badge_name': badge,
        })


def remove_starter_challenges(apps, schema_editor):
    Challenge = apps.get_model('challenges', 'Challenge')
    Challenge.objects.filter(title__in=[c[0] for c in STARTER_CHALLENGES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('challenges', '0002_enable_rls'),
        ('matches', '0004_match_opponent_winner'),
    ]

    operations = [
        migrations.RunPython(add_starter_challenges, remove_starter_challenges),
    ]
