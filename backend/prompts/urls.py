from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('prompts/', views.prompt_list_create, name='prompt-list-create'),
    path('prompts/<uuid:pk>/', views.prompt_detail, name='prompt-detail'),
]