from django.contrib import admin
from .models import River, UserRegister

@admin.register(River)
class RiverAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'quality_index', 'created_at']
    list_filter = ['quality_index', 'created_at']
    search_fields = ['name', 'location']
    ordering = ['-created_at']

@admin.register(UserRegister)
class UserRegisterAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['email', 'full_name']
    ordering = ['-created_at']
