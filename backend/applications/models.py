from django.db import models
from accounts.models import Student
from jobs.models import Job


class Application(models.Model):
    """Job application model"""
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='applications')
    resume = models.FileField(upload_to='resumes/', help_text="Upload PDF file")
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    recruiter_notes = models.TextField(blank=True, null=True, help_text="Internal notes for recruiter")
    
    class Meta:
        unique_together = ['job', 'student']  # Prevent duplicate applications
        ordering = ['-applied_date']
    
    def __str__(self):
        return f"{self.student} applied for {self.job.title} - {self.status}"
