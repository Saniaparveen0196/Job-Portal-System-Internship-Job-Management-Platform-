from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Recruiter, Student
from .serializers import UserSerializer, RecruiterProfileSerializer, StudentProfileSerializer
from .permissions import IsAdmin

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_users(request):
    """List all users with profile information"""
    role = request.query_params.get('role', None)
    queryset = User.objects.all()
    
    if role:
        queryset = queryset.filter(role=role)
    
    users_data = []
    for user in queryset:
        user_data = UserSerializer(user).data
        # Add profile information
        if user.role == 'recruiter' and hasattr(user, 'recruiter_profile'):
            user_data['recruiter_profile'] = {
                'id': user.recruiter_profile.id,
                'is_approved': user.recruiter_profile.is_approved,
                'company_name': user.recruiter_profile.company_name,
            }
        elif user.role == 'student' and hasattr(user, 'student_profile'):
            user_data['student_profile'] = {
                'id': user.student_profile.id,
                'first_name': user.student_profile.first_name,
                'last_name': user.student_profile.last_name,
            }
        users_data.append(user_data)
    
    return Response(users_data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_recruiter(request, recruiter_id):
    """Approve a recruiter"""
    try:
        recruiter = Recruiter.objects.get(id=recruiter_id)
        recruiter.is_approved = True
        recruiter.save()
        return Response(RecruiterProfileSerializer(recruiter).data)
    except Recruiter.DoesNotExist:
        return Response(
            {'error': 'Recruiter not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def block_recruiter(request, recruiter_id):
    """Block a recruiter"""
    try:
        recruiter = Recruiter.objects.get(id=recruiter_id)
        recruiter.is_approved = False
        recruiter.save()
        return Response(RecruiterProfileSerializer(recruiter).data)
    except Recruiter.DoesNotExist:
        return Response(
            {'error': 'Recruiter not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_user(request, user_id):
    """Delete a user"""
    try:
        user = User.objects.get(id=user_id)
        # Don't allow deleting admin users
        if user.role == 'admin' or user.is_staff:
            return Response(
                {'error': 'Cannot delete admin users'},
                status=status.HTTP_403_FORBIDDEN
            )
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
