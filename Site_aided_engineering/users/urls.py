from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("home", views.home, name="home"),
    path("<int:scheme_id>", views.detail, name="detail"),
    path("<int:scheme_id>/update", views.update, name="update")

]
