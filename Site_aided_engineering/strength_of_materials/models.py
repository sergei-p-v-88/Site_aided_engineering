from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Scheme(models.Model):
    name = models.CharField('Название', max_length=80, blank=False)
    description = models.CharField('Описание', max_length=250, blank=True, default='')
    date = models.DateField('Дата публикации', blank=False)

    def __str__(self):
        return f'Название: {self.name}, дата: {self.date}'


    class Meta:
        verbose_name = 'Схема'
        verbose_name_plural = 'Схемы'
