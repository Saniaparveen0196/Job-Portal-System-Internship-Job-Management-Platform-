from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Job
from .serializers import JobSerializer
from accounts.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_all_jobs(request):
    """List all jobs (admin only)"""
    jobs = Job.objects.all().order_by('-date_posted')
    serializer = JobSerializer(jobs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_job(request, job_id):
    """Delete a job (admin only)"""
    try:
        job = Job.objects.get(id=job_id)
        job.delete()
        return Response({'message': 'Job deleted successfully'})
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found'},
            status=status.HTTP_404_NOT_FOUND
        )
