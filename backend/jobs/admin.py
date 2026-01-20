from django.contrib import admin
from .models import Job, JobCategory, BookmarkedJob


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company_name', 'job_type', 'location', 'posted_by', 
                    'is_active', 'is_closed', 'date_posted', 'views_count']
    list_filter = ['job_type', 'is_active', 'is_closed', 'date_posted', 'category']
    search_fields = ['title', 'company_name', 'role', 'description']
    list_editable = ['is_active', 'is_closed']
    readonly_fields = ['date_posted', 'views_count']


@admin.register(BookmarkedJob)
class BookmarkedJobAdmin(admin.ModelAdmin):
    list_display = ['student', 'job', 'created_at']
    list_filter = ['created_at']
    search_fields = ['student__first_name', 'student__last_name', 'job__title']
