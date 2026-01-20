from django.urls import path
from . import views

urlpatterns = [
    path('student/', views.student_dashboard, name='student-dashboard'),
    path('recruiter/', views.recruiter_dashboard, name='recruiter-dashboard'),
    path('admin/', views.admin_dashboard, name='admin-dashboard'),
]
