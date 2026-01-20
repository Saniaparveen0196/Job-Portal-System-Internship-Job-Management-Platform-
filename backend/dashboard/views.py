from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, Student, Recruiter
from jobs.models import Job
from applications.models import Application
from accounts.permissions import IsStudent, IsRecruiter, IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def student_dashboard(request):
    """Student dashboard statistics"""
    student = request.user.student_profile
    
    total_applications = Application.objects.filter(student=student).count()
    applications_by_status = Application.objects.filter(student=student).values('status').annotate(
        count=Count('id')
    )
    
    recent_applications = Application.objects.filter(student=student).order_by('-applied_date')[:5]
    
    status_summary = {
        'applied': Application.objects.filter(student=student, status='applied').count(),
        'accepted': Application.objects.filter(student=student, status='accepted').count(),
        'rejected': Application.objects.filter(student=student, status='rejected').count(),
    }
    
    from applications.serializers import ApplicationSerializer
    
    return Response({
        'total_applications': total_applications,
        'status_summary': status_summary,
        'recent_applications': ApplicationSerializer(recent_applications, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsRecruiter])
def recruiter_dashboard(request):
    """Recruiter dashboard statistics"""
    recruiter = request.user.recruiter_profile
    # Refresh from database to get latest approval status
    recruiter.refresh_from_db()
    
    total_jobs = Job.objects.filter(posted_by=recruiter).count()
    active_jobs = Job.objects.filter(posted_by=recruiter, is_active=True, is_closed=False).count()
    total_applications = Application.objects.filter(job__posted_by=recruiter).count()
    
    applications_by_status = Application.objects.filter(job__posted_by=recruiter).values('status').annotate(
        count=Count('id')
    )
    
    recent_jobs = Job.objects.filter(posted_by=recruiter).order_by('-date_posted')[:5]
    recent_applications = Application.objects.filter(job__posted_by=recruiter).order_by('-applied_date')[:5]
    
    from jobs.serializers import JobSerializer
    from applications.serializers import ApplicationSerializer
    from accounts.serializers import RecruiterProfileSerializer
    
    return Response({
        'total_jobs': total_jobs,
        'active_jobs': active_jobs,
        'total_applications': total_applications,
        'applications_by_status': list(applications_by_status),
        'recent_jobs': JobSerializer(recent_jobs, many=True).data,
        'recent_applications': ApplicationSerializer(recent_applications, many=True).data,
        'recruiter_profile': {
            'is_approved': recruiter.is_approved,
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard(request):
    """Admin dashboard statistics and analytics"""
    total_users = User.objects.count()
    total_students = Student.objects.count()
    total_recruiters = Recruiter.objects.count()
    pending_recruiters = Recruiter.objects.filter(is_approved=False).count()
    
    total_jobs = Job.objects.count()
    active_jobs = Job.objects.filter(is_active=True, is_closed=False).count()
    total_applications = Application.objects.count()
    
    applications_by_status = Application.objects.values('status').annotate(count=Count('id'))
    
    # User growth over time (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    user_growth = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    
    # Jobs posted over time (last 30 days)
    jobs_growth = Job.objects.filter(date_posted__gte=thirty_days_ago).count()
    
    # Applications over time (last 30 days)
    applications_growth = Application.objects.filter(applied_date__gte=thirty_days_ago).count()
    
    # Top job categories
    from jobs.models import JobCategory
    top_categories = JobCategory.objects.annotate(
        job_count=Count('jobs')
    ).order_by('-job_count')[:10]
    
    from jobs.serializers import JobCategorySerializer
    
    return Response({
        'users': {
            'total': total_users,
            'students': total_students,
            'recruiters': total_recruiters,
            'pending_recruiters': pending_recruiters,
            'growth_30_days': user_growth,
        },
        'jobs': {
            'total': total_jobs,
            'active': active_jobs,
            'growth_30_days': jobs_growth,
        },
        'applications': {
            'total': total_applications,
            'by_status': list(applications_by_status),
            'growth_30_days': applications_growth,
        },
        'top_categories': JobCategorySerializer(top_categories, many=True).data,
    })
