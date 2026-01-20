from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Student, Recruiter
from .serializers import (
    UserSerializer, StudentSignupSerializer, RecruiterSignupSerializer,
    StudentProfileSerializer, RecruiterProfileSerializer
)
from .permissions import IsStudent, IsRecruiter, IsAdmin, IsApprovedRecruiter


@api_view(['POST'])
@permission_classes([AllowAny])
def student_signup(request):
    """Student registration"""
    serializer = StudentSignupSerializer(data=request.data)
    if serializer.is_valid():
        student = serializer.save()
        refresh = RefreshToken.for_user(student.user)
        return Response({
            'user': UserSerializer(student.user).data,
            'student': StudentProfileSerializer(student).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def recruiter_signup(request):
    """Recruiter registration"""
    serializer = RecruiterSignupSerializer(data=request.data)
    if serializer.is_valid():
        recruiter = serializer.save()
        refresh = RefreshToken.for_user(recruiter.user)
        return Response({
            'user': UserSerializer(recruiter.user).data,
            'recruiter': RecruiterProfileSerializer(recruiter).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if username is None or password is None:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    refresh = RefreshToken.for_user(user)
    
    response_data = {
        'user': UserSerializer(user).data,
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
    
    # Add role-specific profile data
    if user.role == 'student' and hasattr(user, 'student_profile'):
        response_data['student'] = StudentProfileSerializer(user.student_profile).data
    elif user.role == 'recruiter' and hasattr(user, 'recruiter_profile'):
        response_data['recruiter'] = RecruiterProfileSerializer(user.recruiter_profile).data
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """User logout - blacklist token"""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current user profile"""
    user = request.user
    # Refresh user from database to get latest data
    user.refresh_from_db()
    
    response_data = {
        'user': UserSerializer(user).data,
    }
    
    if user.role == 'student' and hasattr(user, 'student_profile'):
        response_data['student'] = StudentProfileSerializer(user.student_profile).data
    elif user.role == 'recruiter' and hasattr(user, 'recruiter_profile'):
        # Refresh recruiter profile to get latest approval status
        user.recruiter_profile.refresh_from_db()
        response_data['recruiter'] = RecruiterProfileSerializer(user.recruiter_profile).data
        # Also include approval status in user data for easy access
        response_data['user']['recruiter_profile'] = {
            'is_approved': user.recruiter_profile.is_approved,
        }
    
    return Response(response_data, status=status.HTTP_200_OK)


class StudentProfileViewSet(viewsets.ModelViewSet):
    """Student profile viewset"""
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return Student.objects.filter(user=self.request.user)
    
    def get_object(self):
        return self.request.user.student_profile


class RecruiterProfileViewSet(viewsets.ModelViewSet):
    """Recruiter profile viewset"""
    serializer_class = RecruiterProfileSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    
    def get_queryset(self):
        return Recruiter.objects.filter(user=self.request.user)
    
    def get_object(self):
        return self.request.user.recruiter_profile
