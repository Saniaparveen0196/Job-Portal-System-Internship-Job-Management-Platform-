from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import admin_views

router = DefaultRouter()
router.register(r'students/profile', views.StudentProfileViewSet, basename='student-profile')
router.register(r'recruiters/profile', views.RecruiterProfileViewSet, basename='recruiter-profile')

urlpatterns = [
    path('auth/signup/student/', views.student_signup, name='student-signup'),
    path('auth/signup/recruiter/', views.recruiter_signup, name='recruiter-signup'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/user/', views.current_user, name='current-user'),
    # Admin endpoints
    path('admin/users/', admin_views.list_users, name='admin-list-users'),
    path('admin/recruiters/<int:recruiter_id>/approve/', admin_views.approve_recruiter, name='admin-approve-recruiter'),
    path('admin/recruiters/<int:recruiter_id>/block/', admin_views.block_recruiter, name='admin-block-recruiter'),
    path('admin/users/<int:user_id>/delete/', admin_views.delete_user, name='admin-delete-user'),
    path('', include(router.urls)),
]
