from django.shortcuts import render, redirect
from strength_of_materials.models import Scheme

# Create your views here.


def index(request):
    return redirect('users/home')


def home(request):
    context = {'schemes': Scheme.objects.all()}
    return render(request, 'users/home.html', context=context)
