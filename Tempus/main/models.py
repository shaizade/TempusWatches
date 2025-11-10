from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
import uuid


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Создает и возвращает пользователя с email, паролем и дополнительными полями.
        """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)

        # Автоматически генерируем username если не предоставлен
        if 'username' not in extra_fields or not extra_fields['username']:
            base_username = email.split('@')[0]
            extra_fields['username'] = f"{base_username}_{uuid.uuid4().hex[:8]}"

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Создает и возвращает суперпользователя с email и паролем.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # Автоматически заполняем обязательные поля если они не предоставлены
        if 'first_name' not in extra_fields:
            extra_fields['first_name'] = 'Admin'
        if 'last_name' not in extra_fields:
            extra_fields['last_name'] = 'User'
        if 'phone' not in extra_fields:
            extra_fields['phone'] = '+79999999999'

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Номер телефона должен быть в формате: '+79999999999'. Допускается до 15 цифр."
    )
    phone = models.CharField(
        validators=[phone_regex],
        max_length=17,
        unique=True,
        blank=False,
        null=False
    )
    first_name = models.CharField(max_length=30, blank=False)
    last_name = models.CharField(max_length=30, blank=False)

    # Делаем username необязательным
    username = models.CharField(
        max_length=150,
        unique=False,
        blank=True,
        null=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone']

    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        # Автоматически генерируем username если он пустой
        if not self.username:
            base_username = self.email.split('@')[0]
            self.username = f"{base_username}_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(
        validators=[CustomUser.phone_regex],
        max_length=17,
        blank=True,
        null=True
    )
    address = models.TextField(blank=True, null=True)
    email_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} Profile"

    def save(self, *args, **kwargs):
        # Если телефон в профиле пустой, копируем из пользователя
        if not self.phone and self.user.phone:
            self.phone = self.user.phone
        super().save(*args, **kwargs)


class BankCard(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='cards')
    card_number = models.CharField(max_length=19)  # Храним только •••• •••• •••• 1234
    expiry_date = models.CharField(max_length=5)
    cvc = models.CharField(max_length=3)
    card_holder = models.CharField(max_length=255)
    card_type = models.CharField(max_length=20, default='VISA')
    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', '-created_at']

    def __str__(self):
        return f"{self.card_type} {self.card_number}"

    def save(self, *args, **kwargs):
        # Если это первая карта пользователя, делаем ее основной
        if not self.pk and not self.user.cards.filter(is_primary=True).exists():
            self.is_primary = True

        # Если делаем карту основной, снимаем статус с других карт
        if self.is_primary:
            BankCard.objects.filter(user=self.user, is_primary=True).exclude(pk=self.pk).update(is_primary=False)

        super().save(*args, **kwargs)

    def get_masked_number(self):
        return self.card_number