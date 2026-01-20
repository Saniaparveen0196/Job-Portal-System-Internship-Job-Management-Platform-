from rest_framework import serializers
from .models import Job, JobCategory, BookmarkedJob
from accounts.serializers import RecruiterProfileSerializer


class JobCategorySerializer(serializers.ModelSerializer):
    """Job category serializer"""
    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class JobSerializer(serializers.ModelSerializer):
    """Job serializer"""
    posted_by = RecruiterProfileSerializer(read_only=True)
    category = JobCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    applications_count = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'company_name', 'role', 'location', 
                  'job_type', 'category', 'category_id', 'salary_range', 'posted_by',
                  'date_posted', 'deadline', 'is_active', 'is_closed', 'requirements',
                  'benefits', 'tags', 'views_count', 'applications_count', 'is_bookmarked']
        read_only_fields = ['id', 'date_posted', 'views_count', 'posted_by']
    
    def get_applications_count(self, obj):
        return obj.applications.count()
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(request.user, 'student_profile'):
                return BookmarkedJob.objects.filter(
                    student=request.user.student_profile,
                    job=obj
                ).exists()
        return False
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        recruiter = self.context['request'].user.recruiter_profile
        validated_data['posted_by'] = recruiter
        
        if category_id:
            try:
                category = JobCategory.objects.get(id=category_id)
                validated_data['category'] = category
            except JobCategory.DoesNotExist:
                pass
        
        return super().create(validated_data)


class BookmarkedJobSerializer(serializers.ModelSerializer):
    """Bookmarked job serializer"""
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = BookmarkedJob
        fields = ['id', 'job', 'job_id', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        student = self.context['request'].user.student_profile
        validated_data['student'] = student
        
        try:
            job = Job.objects.get(id=job_id)
            validated_data['job'] = job
        except Job.DoesNotExist:
            raise serializers.ValidationError("Job not found")
        
        return super().create(validated_data)
