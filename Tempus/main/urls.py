from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('account/', views.account_view, name='account'),
    path('account/add-card/', views.add_card_view, name='add_card'),
    path('account/delete-card/<int:card_id>/', views.delete_card_view, name='delete_card'),
    path('api/update-profile/', views.update_profile, name='update_profile'),
]