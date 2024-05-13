from django.shortcuts import render, redirect
from .models import Scheme
from .forms import SchemeForm
from django.http import JsonResponse
import json


def create(request):
    if request.method == 'POST':
        form = SchemeForm(request.POST)
        if form.is_valid():
            scheme = Scheme.objects.create(name=form.cleaned_data['name'], description=form.cleaned_data['description'])
            scheme.save()
            return redirect(f'draw_scheme/{scheme.id}')
        else:
            print("Ощибка заполнения формы")

    form = SchemeForm()
    data = {'form': form, 'title': 'создание нового проекта'}
    return render(request, 'beam/create.html', data)


def draw_scheme(request, scheme_id):
    scheme = Scheme.objects.get(id=scheme_id)
    context = {'project': Scheme.objects.get(id=scheme_id)}
    if request.method == 'POST':
        print("1")
        elements = request.POST.get('elements')
        elements = json.loads(elements)
        print(elements, type(elements))

        scheme.data = elements
        scheme.save()
        return redirect('home')
    return render(request, 'beam/draw_scheme.html', context=context)


def detail(request, scheme_id):
    project = Scheme.objects.get(id=scheme_id)
    print(type(project.data))
    context = {'project': Scheme.objects.get(id=scheme_id)}
    return render(request, 'beam/detail.html', context=context)


def delete(request, scheme_id):
    Scheme.objects.get(id=scheme_id).delete()
    return redirect('home')


def update(request, scheme_id):
    return redirect('home')
