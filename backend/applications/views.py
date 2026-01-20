from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from .models import Application
from .serializers import ApplicationSerializer, ApplicationStatusUpdateSerializer
from accounts.permissions import IsStudent, IsRecruiter, IsApprovedRecruiter, IsAdmin
from jobs.models import Job


class ApplicationViewSet(viewsets.ModelViewSet):
    """Application viewset"""
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Application.objects.filter(student=user.student_profile)
        elif user.role == 'recruiter':
            # Recruiters can see applications for their jobs
            return Application.objects.filter(job__posted_by=user.recruiter_profile)
        elif user.role == 'admin' or user.is_staff:
            # Admins can see all applications
            return Application.objects.all()
        return Application.objects.none()
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsStudent()]
        elif self.action in ['update', 'partial_update', 'update_status']:
            # Allow both approved recruiters and admins to update status
            return [IsAuthenticated()]
        elif self.action in ['retrieve', 'list']:
            # Allow authenticated users to view (queryset filters by role)
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        application = serializer.save()
        # Send email notification to recruiter
        self.send_application_email(application, 'new_application')
    
    @action(detail=True, methods=['put', 'patch'])
    def update_status(self, request, pk=None):
        """Update application status (recruiter or admin)"""
        application = self.get_object()
        
        # Allow admins to update any application
        is_admin = request.user.role == 'admin' or request.user.is_staff
        
        # Check if recruiter owns the job (if not admin)
        if not is_admin and application.job.posted_by.user != request.user:
            return Response(
                {'error': 'You do not have permission to update this application'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ApplicationStatusUpdateSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            old_status = application.status
            serializer.save()
            
            # Send email notification to student if status changed
            if old_status != application.status:
                self.send_application_email(application, 'status_update')
            
            return Response(ApplicationSerializer(application).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_application_email(self, application, email_type):
        """Send email notification"""
        try:
            if email_type == 'new_application':
                subject = f'New Application for {application.job.title}'
                message = f'''
                A new application has been received for the position: {application.job.title}
                
                Applicant: {application.student.first_name} {application.student.last_name}
                Applied Date: {application.applied_date}
                
                Please review the application in your dashboard.
                '''
                recipient = application.job.posted_by.user.email
            
            elif email_type == 'status_update':
                subject = f'Application Status Update - {application.job.title}'
                message = f'''
                Your application status for {application.job.title} at {application.job.company_name} has been updated.
                
                New Status: {application.get_status_display()}
                
                {'Notes: ' + application.recruiter_notes if application.recruiter_notes else ''}
                '''
                recipient = application.student.user.email
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@jobportal.com',
                [recipient],
                fail_silently=True,
            )
        except Exception as e:
            # Log error but don't fail the request
            print(f"Email sending failed: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsApprovedRecruiter])
def job_applications(request, job_id):
    """Get all applications for a specific job"""
    try:
        job = Job.objects.get(id=job_id, posted_by=request.user.recruiter_profile)
        applications = Application.objects.filter(job=job)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found or you do not have permission'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_applications(request):
    """Get all applications (admin only)"""
    from accounts.permissions import IsAdmin
    if not IsAdmin().has_permission(request, None):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    applications = Application.objects.all().order_by('-applied_date')
    serializer = ApplicationSerializer(applications, many=True, context={'request': request})
    return Response(serializer.data)