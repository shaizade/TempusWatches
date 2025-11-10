from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import CustomUser, UserProfile, BankCard
import re


class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'login-input',
            'placeholder': 'Имя',
            'id': 'registerFirstName'
        })
    )
    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'login-input',
            'placeholder': 'Фамилия',
            'id': 'registerLastName'
        })
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'login-input',
            'placeholder': 'Почта',
            'id': 'registerEmail'
        })
    )
    phone = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'login-input',
            'placeholder': 'Номер телефона',
            'id': 'registerPhone'
        })
    )
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'login-input password-input',
            'placeholder': 'Пароль',
            'id': 'registerPassword'
        })
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'login-input password-input',
            'placeholder': 'Повторите пароль',
            'id': 'repeatPassword'
        })
    )

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'phone', 'password1', 'password2')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError('Пользователь с таким email уже существует')
        return email

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        # Очищаем номер от лишних символов
        clean_phone = re.sub(r'[^\d+]', '', phone)

        if CustomUser.objects.filter(phone=clean_phone).exists():
            raise forms.ValidationError('Пользователь с таким номером телефона уже существует')

        # Проверяем формат номера
        if not re.match(r'^\+?1?\d{9,15}$', clean_phone):
            raise forms.ValidationError('Номер телефона должен быть в формате: +79999999999')

        return clean_phone


class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'login-input',
            'placeholder': 'Email или номер телефона',
            'id': 'loginEmail'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'login-input password-input',
            'placeholder': 'Пароль',
            'id': 'loginPassword'
        })
    )

    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        if username and password:
            user = None

            # Пробуем найти пользователя по email
            try:
                validate_email(username)
                user = CustomUser.objects.filter(email=username).first()
            except ValidationError:
                # Если не email, ищем по номеру телефона
                clean_phone = re.sub(r'[^\d+]', '', username)
                user = CustomUser.objects.filter(phone=clean_phone).first()

            if user is not None and user.check_password(password):
                self.user_cache = user
            else:
                raise forms.ValidationError('Неверный email/телефон или пароль')

        return self.cleaned_data


class BankCardForm(forms.ModelForm):
    class Meta:
        model = BankCard
        fields = ['card_number', 'expiry_date', 'cvc', 'card_holder']
        widgets = {
            'card_number': forms.TextInput(attrs={
                'placeholder': '1234 5678 9012 3456',
                'id': 'cardNumber'
            }),
            'expiry_date': forms.TextInput(attrs={
                'placeholder': 'MM/YY',
                'id': 'cardExpiry'
            }),
            'cvc': forms.TextInput(attrs={
                'placeholder': '123',
                'id': 'cardCVC'
            }),
            'card_holder': forms.TextInput(attrs={
                'placeholder': 'ELIJAH SHAIZADE',
                'id': 'cardHolder'
            }),
        }

    def clean_card_number(self):
        card_number = self.cleaned_data.get('card_number')
        clean_number = card_number.replace(' ', '')
        if not clean_number.isdigit() or len(clean_number) != 16:
            raise forms.ValidationError('Номер карты должен содержать 16 цифр')
        return card_number

    def clean_expiry_date(self):
        expiry_date = self.cleaned_data.get('expiry_date')
        if not re.match(r'^\d{2}/\d{2}$', expiry_date):
            raise forms.ValidationError('Формат даты: MM/YY')

        # Проверяем что месяц от 1 до 12
        month, year = expiry_date.split('/')
        if not (1 <= int(month) <= 12):
            raise forms.ValidationError('Месяц должен быть от 01 до 12')

        return expiry_date

    def clean_cvc(self):
        cvc = self.cleaned_data.get('cvc')
        if not cvc.isdigit() or len(cvc) != 3:
            raise forms.ValidationError('CVC должен содержать 3 цифры')
        return cvc

    def clean_card_holder(self):
        card_holder = self.cleaned_data.get('card_holder')
        if not card_holder or len(card_holder.strip()) < 2:
            raise forms.ValidationError('Введите имя владельца карты')
        return card_holder.upper()


class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['phone', 'address']
        widgets = {
            'phone': forms.TextInput(attrs={'class': 'form-input'}),
            'address': forms.Textarea(attrs={'class': 'form-input', 'rows': 3}),
        }