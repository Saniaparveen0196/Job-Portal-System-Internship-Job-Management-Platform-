from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Student, Recruiter


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_staff', 'date_joined']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone_number')}),
    )


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'user', 'location', 'created_at']
    list_filter = ['created_at']
    search_fields = ['first_name', 'last_name', 'user__username', 'user__email']


@admin.register(Recruiter)
class RecruiterAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'user', 'is_approved', 'location', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['company_name', 'user__username', 'user__email']
    list_editable = ['is_approved']
