from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.views.decorators.http import require_http_methods
import json
from .forms import CustomUserCreationForm, CustomAuthenticationForm, BankCardForm, ProfileForm
from .models import BankCard, UserProfile, CustomUser
import re


def index_view(request):
    return render(request, 'main/index.html')


def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Создаем профиль с данными из формы
            UserProfile.objects.create(
                user=user,
                phone=form.cleaned_data.get('phone'),
                address=''
            )
            login(request, user)

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Регистрация прошла успешно!',
                    'redirect_url': '/account/'
                })
            return redirect('account')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'errors': form.errors
                })
    return JsonResponse({'success': False, 'errors': 'Method not allowed'})


def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Вы успешно вошли в аккаунт!',
                    'redirect_url': '/account/'
                })
            return redirect('account')

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'errors': form.errors
            })
    return JsonResponse({'success': False, 'errors': 'Method not allowed'})


def logout_view(request):
    logout(request)
    return redirect('home')


@login_required
def account_view(request):
    user_cards = BankCard.objects.filter(user=request.user, is_active=True)
    profile = getattr(request.user, 'profile', None)

    context = {
        'user_cards': user_cards,
        'profile': profile,
    }
    return render(request, 'main/account.html', context)


@login_required
@require_http_methods(["POST"])
def add_card_view(request):
    try:
        data = json.loads(request.body)
        form = BankCardForm(data)
        if form.is_valid():
            card = form.save(commit=False)
            card.user = request.user

            # Сохраняем только последние 4 цифры
            card_number_clean = card.card_number.replace(' ', '')
            card.card_number = f"•••• •••• •••• {card_number_clean[-4:]}"

            # Определяем тип карты
            first_digit = card_number_clean[0]
            if first_digit == '4':
                card.card_type = 'VISA'
            elif first_digit == '5':
                card.card_type = 'MasterCard'
            else:
                card.card_type = 'Other'

            # Если это первая карта, делаем ее основной
            if not BankCard.objects.filter(user=request.user, is_active=True).exists():
                card.is_primary = True

            card.save()

            return JsonResponse({
                'success': True,
                'message': 'Карта успешно добавлена!',
                'card': {
                    'id': card.id,
                    'type': card.card_type,
                    'number': card.card_number,
                    'expiry': card.expiry_date,
                    'holder': card.card_holder,
                    'is_primary': card.is_primary
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            })
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'errors': 'Invalid JSON'})
    except Exception as e:
        return JsonResponse({'success': False, 'errors': str(e)})


@login_required
@require_http_methods(["DELETE"])
def delete_card_view(request, card_id):
    try:
        card = BankCard.objects.get(id=card_id, user=request.user)

        # Если удаляем основную карту, делаем следующую активную карту основной
        if card.is_primary:
            other_cards = BankCard.objects.filter(user=request.user, is_active=True).exclude(id=card_id)
            if other_cards.exists():
                new_primary = other_cards.first()
                new_primary.is_primary = True
                new_primary.save()

        card.delete()
        return JsonResponse({'success': True, 'message': 'Карта удалена'})
    except BankCard.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Карта не найдена'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
@require_POST
def update_profile(request):
    try:
        data = json.loads(request.body)
        user = request.user

        errors = {}

        # Обновляем email
        if 'email' in data:
            new_email = data['email'].strip()

            # Валидация email формата
            try:
                validate_email(new_email)
            except ValidationError:
                errors['email'] = ['Пожалуйста, введите корректный адрес электронной почты.']

            # Проверяем что email не занят другим пользователем (ТОЛЬКО ЕСЛИ ФОРМАТ КОРРЕКТНЫЙ)
            if 'email' not in errors:
                from django.contrib.auth import get_user_model
                User = get_user_model()

                if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                    errors['email'] = ['Этот email уже используется другим пользователем']
                else:
                    user.email = new_email

        # Обновляем телефон
        if 'phone' in data:
            new_phone = data['phone'].strip()

            # Валидация телефона (упрощенная версия)
            phone_regex = r'^\+?7\d{10}$'  # Формат: +79999999999 или 79999999999
            clean_phone = re.sub(r'\D', '', new_phone)  # Убираем все не-цифры

            if not re.match(phone_regex, clean_phone):
                errors['phone'] = ['Неверный формат номера телефона. Должен быть: 79999999999']
            else:
                # Проверяем что телефон не занят другим пользователем (ТОЛЬКО ЕСЛИ ФОРМАТ КОРРЕКТНЫЙ)
                if User.objects.filter(phone=clean_phone).exclude(pk=user.pk).exists():
                    errors['phone'] = ['Этот номер телефона уже используется другим пользователем']
                else:
                    user.phone = clean_phone

        # Если есть ошибки - возвращаем их
        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            })

        # Сохраняем пользователя только если нет ошибок
        user.save()

        return JsonResponse({
            'success': True,
            'message': 'Данные успешно обновлены'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка сервера: {str(e)}'
        })