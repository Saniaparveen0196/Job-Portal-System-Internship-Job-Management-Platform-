from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Check if user is a student"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'


class IsRecruiter(permissions.BasePermission):
    """Check if user is a recruiter"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'recruiter'


class IsAdmin(permissions.BasePermission):
    """Check if user is an admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_staff)


class IsApprovedRecruiter(permissions.BasePermission):
    """Check if user is an approved recruiter"""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.role == 'recruiter'):
            return False
        try:
            return request.user.recruiter_profile.is_approved
        except:
            return False


class IsRecruiterOwner(permissions.BasePermission):
    """Check if recruiter owns the job"""
    def has_object_permission(self, request, view, obj):
        if request.user.role != 'recruiter':
            return False
        return obj.posted_by.user == request.user
