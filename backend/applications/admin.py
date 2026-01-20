from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'job', 'status', 'applied_date', 'updated_at']
    list_filter = ['status', 'applied_date', 'updated_at']
    search_fields = ['student__first_name', 'student__last_name', 'job__title', 'job__company_name']
    list_editable = ['status']
    readonly_fields = ['applied_date', 'updated_at']
