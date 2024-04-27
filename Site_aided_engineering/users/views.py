from django.shortcuts import render

from .models import Scheme

# Create your views here.


#request - это запрос
def index(request):
    return render(request, 'users/home.html')


def about(request):
    return render(request, 'users/about.html')
