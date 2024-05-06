from django.urls import path
from . import views

urlpatterns = [
    path('create', views.create, name='create'),
    path("<int:scheme_id>", views.detail, name="detail"),
    path("<int:scheme_id>/delete", views.delete, name="delete"),
    path("<int:scheme_id>/update", views.update, name="update"),
]
