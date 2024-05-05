from django.shortcuts import render, redirect
from .models import Scheme
from .forms import SchemeForm

# Create your views here.


def draw_scheme(request):
    context = {'schemes': Scheme.objects.all()}
    return render(request, 'beam/draw_scheme.html', context=context)


def create(request):
    if request.method == 'POST':
        form = SchemeForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('draw_scheme')
        else:
            print("Ощибка заполнения формы")

    form = SchemeForm()
    data = {'form': form, 'title': 'создание нового проекта'}
    return render(request, 'beam/create.html', data)


def detail(request, scheme_id):
    context = {'project': Scheme.objects.get(id=scheme_id)}
    return render(request, 'beam/detail.html', context=context)


def delete(request, scheme_id):
    Scheme.objects.get(id=scheme_id).delete()
    return redirect('home')
    pass


def update(request, scheme_id):
    pass
