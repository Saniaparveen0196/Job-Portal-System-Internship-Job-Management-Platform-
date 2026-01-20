from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'applications', views.ApplicationViewSet, basename='application')

urlpatterns = [
    path('jobs/<int:job_id>/applications/', views.job_applications, name='job-applications'),
    path('admin/applications/', views.admin_applications, name='admin-applications'),
    path('', include(router.urls)),
]
