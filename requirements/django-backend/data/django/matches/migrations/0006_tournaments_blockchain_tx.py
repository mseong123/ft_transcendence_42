# Generated by Django 4.2.1 on 2024-04-26 06:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matches', '0005_tournaments_winner'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournaments',
            name='blockchain_tx',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
