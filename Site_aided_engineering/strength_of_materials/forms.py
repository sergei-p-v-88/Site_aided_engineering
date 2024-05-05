from .models import Scheme
from django.forms import ModelForm, TextInput, DateInput, Textarea


class SchemeForm(ModelForm):
    class Meta:
        model = Scheme
        fields = ['name', 'description']

        widgets = {
            'name': TextInput(attrs={
                'placeholder': 'Название'
            }),
            'description': Textarea(attrs={
                'placeholder': 'Описание'
            }),
        }
