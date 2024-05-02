from django.shortcuts import render, redirect
from strength_of_materials.models import Scheme

# Create your views here.


def index(request):
    return redirect('users/home')


def home(request):
    context = {'schemes': Scheme.objects.order_by('-date')}
    return render(request, 'users/home.html', context=context)


def detail(request, scheme_id):
    context = {'project': Scheme.objects.get(id=scheme_id)}
    return render(request, 'users/detail.html', context=context)


def update(request, scheme_id):
    context = {'project': Scheme.objects.get(id=scheme_id), 'title': 'редактирование проекта'}
    return render(request, 'beam/create.html', context=context)

