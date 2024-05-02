from .models import Scheme
from django.forms import ModelForm, TextInput, DateInput, Textarea


class SchemeForm(ModelForm):
    class Meta:
        model = Scheme
        fields = ['name', 'description', 'date']

        widgets = {
            'name': TextInput(attrs={
                'placeholder': 'Название'
            }),
            'description': Textarea(attrs={
                'placeholder': 'Описание'
            }),
            'date': DateInput(attrs={
                'placeholder': 'Дата',
                'type': 'date',
            })
        }
