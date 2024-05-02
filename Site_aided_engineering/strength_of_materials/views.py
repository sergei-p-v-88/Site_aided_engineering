from django.shortcuts import render
from .models import Scheme

# Create your views here.


def index(request):
    context = {'schemes': Scheme.objects.all()}
    return render(request, 'beam_calculation.html', context=context)
