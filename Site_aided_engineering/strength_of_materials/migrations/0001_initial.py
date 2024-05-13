# Generated by Django 4.2.11 on 2024-05-05 15:48

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Scheme',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80, verbose_name='Название')),
                ('description', models.TextField(blank=True, default='', verbose_name='Описание')),
                ('time_create', models.DateTimeField(auto_now_add=True, verbose_name='Дата публикации')),
                ('time_update', models.DateTimeField(auto_now=True, verbose_name='Дата изминения')),
            ],
            options={
                'verbose_name': 'Схема',
                'verbose_name_plural': 'Схемы',
            },
        ),
    ]
