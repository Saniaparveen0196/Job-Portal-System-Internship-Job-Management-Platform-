from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import admin_views

router = DefaultRouter()
router.register(r'jobs', views.JobViewSet, basename='job')
router.register(r'categories', views.JobCategoryViewSet, basename='category')
router.register(r'bookmarks', views.BookmarkedJobViewSet, basename='bookmark')

urlpatterns = [
    path('search-suggestions/', views.search_suggestions, name='search-suggestions'),
    # Admin endpoints
    path('admin/jobs/', admin_views.list_all_jobs, name='admin-list-jobs'),
    path('admin/jobs/<int:job_id>/delete/', admin_views.delete_job, name='admin-delete-job'),
    path('', include(router.urls)),
]
