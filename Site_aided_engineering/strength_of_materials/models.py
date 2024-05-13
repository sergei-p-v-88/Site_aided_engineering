from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Scheme(models.Model):
    name = models.CharField('Название', max_length=80, blank=False)
    description = models.TextField('Описание', blank=True, default='')
    time_create = models.DateTimeField('Дата публикации', auto_now_add=True)
    time_update = models.DateTimeField('Дата изминения', auto_now=True)
    data = models.JSONField(default=[])

    def __str__(self):
        return f'Название: {self.name}, дата изминения: {self.time_update}'

    class Meta:
        verbose_name = 'Схема'
        verbose_name_plural = 'Схемы'
