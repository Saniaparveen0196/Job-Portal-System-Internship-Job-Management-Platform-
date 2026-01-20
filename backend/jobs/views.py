from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from .models import Job, JobCategory, BookmarkedJob
from .serializers import JobSerializer, JobCategorySerializer, BookmarkedJobSerializer
from accounts.permissions import IsStudent, IsRecruiter, IsApprovedRecruiter


class JobViewSet(viewsets.ModelViewSet):
    """Job viewset"""
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'location', 'category', 'is_active', 'is_closed']
    search_fields = ['title', 'description', 'company_name', 'role', 'tags']
    ordering_fields = ['date_posted', 'views_count']
    ordering = ['-date_posted']
    
    def get_queryset(self):
        user = self.request.user
        
        # If recruiter is viewing their own jobs (via my_jobs action or filtering)
        if user.is_authenticated and user.role == 'recruiter':
            # Check if this is a request for recruiter's own jobs
            my_jobs = self.request.query_params.get('my_jobs', None)
            if my_jobs == 'true' or self.action == 'my_jobs':
                queryset = Job.objects.filter(posted_by=user.recruiter_profile)
            else:
                # For list/retrieve, show only active jobs to everyone
                queryset = Job.objects.filter(is_active=True, is_closed=False)
        else:
            # Public view - only active, non-closed jobs
            queryset = Job.objects.filter(is_active=True, is_closed=False)
        
        # Allow filtering by search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company_name__icontains=search) |
                Q(role__icontains=search) |
                Q(tags__icontains=search)
            )
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        elif self.action == 'my_jobs':
            return [IsAuthenticated(), IsRecruiter()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsApprovedRecruiter()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsRecruiter])
    def my_jobs(self, request):
        """Get all jobs posted by the current recruiter"""
        recruiter = request.user.recruiter_profile
        jobs = Job.objects.filter(posted_by=recruiter).order_by('-date_posted')
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """Increment views count when job is viewed"""
        instance = self.get_object()
        # Only increment for public views, not for recruiters viewing their own jobs
        if not (request.user.is_authenticated and 
                request.user.role == 'recruiter' and 
                instance.posted_by.user == request.user):
            instance.views_count += 1
            instance.save(update_fields=['views_count'])
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update job - ensure recruiter owns it"""
        instance = self.get_object()
        if instance.posted_by.user != request.user:
            return Response(
                {'error': 'You do not have permission to update this job'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete job - ensure recruiter owns it"""
        instance = self.get_object()
        if instance.posted_by.user != request.user:
            return Response(
                {'error': 'You do not have permission to delete this job'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class JobCategoryViewSet(viewsets.ModelViewSet):
    """Job category viewset"""
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular categories"""
        categories = JobCategory.objects.annotate(
            job_count=Count('jobs')
        ).order_by('-job_count')[:10]
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class BookmarkedJobViewSet(viewsets.ModelViewSet):
    """Bookmarked job viewset"""
    serializer_class = BookmarkedJobSerializer
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return BookmarkedJob.objects.filter(student=self.request.user.student_profile)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@api_view(['GET'])
@permission_classes([AllowAny])
def search_suggestions(request):
    """Get search suggestions for autocomplete"""
    query = request.query_params.get('q', '')
    if len(query) < 2:
        return Response({'suggestions': []})
    
    jobs = Job.objects.filter(
        Q(title__icontains=query) | Q(company_name__icontains=query)
    ).values_list('title', 'company_name')[:10]
    
    suggestions = []
    seen = set()
    for title, company in jobs:
        if title.lower() not in seen:
            suggestions.append(title)
            seen.add(title.lower())
        if company.lower() not in seen and len(suggestions) < 10:
            suggestions.append(company)
            seen.add(company.lower())
    
    return Response({'suggestions': suggestions[:10]})
