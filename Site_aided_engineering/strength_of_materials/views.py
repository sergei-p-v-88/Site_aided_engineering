from django.shortcuts import render, redirect
from .models import Scheme
from .forms import SchemeForm


def create(request):
    if request.method == 'POST':
        form = SchemeForm(request.POST)
        if form.is_valid():
            #print(form.cleaned_data)
            project = Scheme.objects.create(name=form.cleaned_data['name'], description=form.cleaned_data['description'])
            project.save()
            return render(request, 'beam/draw_scheme.html', {'project': project})
        else:
            print("Ощибка заполнения формы")

        #нажатие на кнопку
        elements = request.POST.get('elements')
        print(elements)

    form = SchemeForm()
    data = {'form': form, 'title': 'создание нового проекта'}
    return render(request, 'beam/create.html', data)


def draw_scheme(request):
    pass


def detail(request, scheme_id):
    context = {'project': Scheme.objects.get(id=scheme_id)}
    return render(request, 'beam/detail.html', context=context)


def delete(request, scheme_id):
    Scheme.objects.get(id=scheme_id).delete()
    return redirect('home')


def update(request, scheme_id):
    return redirect('home')
