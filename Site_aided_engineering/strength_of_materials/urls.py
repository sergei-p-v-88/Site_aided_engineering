from django.urls import path
from . import views

urlpatterns = [
    path('draw_scheme', views.draw_scheme, name='draw_scheme'),
    path('create', views.create, name='create'),
]
