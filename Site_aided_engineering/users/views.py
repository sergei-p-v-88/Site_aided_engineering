from django.shortcuts import render

from .models import Scheme

# Create your views here.


#request - это запрос
def index(request):
    context = {
        'title': 'Главная страница!!!',
        'values': ['1 проект', '2 проект', '3 проект']
    }
    return render(request, 'users/home.html', context=context)


def home(request):
    return render(request, 'users/home.html')
