from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
from accounts.serializers import StudentProfileSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Application serializer"""
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)
    student = StudentProfileSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_id', 'student', 'resume', 'cover_letter', 
                  'status', 'applied_date', 'updated_at', 'recruiter_notes']
        read_only_fields = ['id', 'applied_date', 'updated_at', 'student']
    
    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        student = self.context['request'].user.student_profile
        validated_data['student'] = student
        
        try:
            from jobs.models import Job
            job = Job.objects.get(id=job_id, is_active=True, is_closed=False)
            validated_data['job'] = job
        except Job.DoesNotExist:
            raise serializers.ValidationError("Job not found or not available")
        
        # Check if already applied
        if Application.objects.filter(job=job, student=student).exists():
            raise serializers.ValidationError("You have already applied for this job")
        
        return super().create(validated_data)


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating application status (recruiter only)"""
    class Meta:
        model = Application
        fields = ['status', 'recruiter_notes']
    
    def validate_status(self, value):
        if value not in ['applied', 'accepted', 'rejected']:
            raise serializers.ValidationError("Invalid status")
        return value
