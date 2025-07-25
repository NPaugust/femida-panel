# Generated by Django 5.2.3 on 2025-07-19 16:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0002_building_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='payment_status',
            field=models.CharField(choices=[('pending', 'В ожидании'), ('paid', 'Оплачено'), ('unpaid', 'Не оплачено')], default='pending', max_length=20, verbose_name='Статус оплаты'),
        ),
    ]
