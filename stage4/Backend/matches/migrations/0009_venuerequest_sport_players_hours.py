from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("matches", "0008_venuerequest"),
    ]

    operations = [
        migrations.AddField(
            model_name="venuerequest",
            name="end_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="venuerequest",
            name="end_time",
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="venuerequest",
            name="max_players",
            field=models.PositiveIntegerField(
                blank=True,
                null=True,
                validators=[django.core.validators.MinValueValidator(1)],
            ),
        ),
        migrations.AddField(
            model_name="venuerequest",
            name="sport",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="VenueRequest",
                to="matches.sport",
            ),
        ),
    ]