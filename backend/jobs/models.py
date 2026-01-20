from django.db import models
from accounts.models import Recruiter


class JobCategory(models.Model):
    """Job category model"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Job(models.Model):
    """Job/Internship posting model"""
    JOB_TYPE_CHOICES = [
        ('internship', 'Internship'),
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    company_name = models.CharField(max_length=200)
    role = models.CharField(max_length=100, help_text="e.g., Software Engineer, Data Analyst")
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full-time')
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    salary_range = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., $50,000 - $70,000")
    posted_by = models.ForeignKey(Recruiter, on_delete=models.CASCADE, related_name='posted_jobs')
    date_posted = models.DateTimeField(auto_now_add=True)
    deadline = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_closed = models.BooleanField(default=False)
    requirements = models.TextField(blank=True, null=True)
    benefits = models.TextField(blank=True, null=True)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    views_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-date_posted']
    
    def __str__(self):
        return f"{self.title} - {self.company_name}"


class BookmarkedJob(models.Model):
    """Bookmarked jobs by students"""
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE, related_name='bookmarked_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'job']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student} bookmarked {self.job.title}"
