from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Scheme(models.Model):
    #user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=80, blank=False)
    description = models.CharField(max_length=160, blank=True, default='')
    #pub_data = models.DateTimeField("Дата публикации")
    #data = models.JSONField()

    def __str__(self):
        return f'Название проекта: {self.name}'
