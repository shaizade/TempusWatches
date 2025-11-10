from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserProfile, BankCard

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'email_confirmed', 'created_at')
    list_filter = ('email_confirmed', 'created_at')
    search_fields = ('user__email', 'phone')

@admin.register(BankCard)
class BankCardAdmin(admin.ModelAdmin):
    list_display = ('user', 'card_type', 'card_number', 'is_active', 'is_primary')
    list_filter = ('card_type', 'is_active', 'is_primary')
    search_fields = ('user__email', 'card_holder')