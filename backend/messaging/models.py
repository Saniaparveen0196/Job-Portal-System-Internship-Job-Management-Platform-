from django.db import models
from accounts.models import User, Student, Recruiter


class Conversation(models.Model):
    """Represents a conversation between a recruiter and a student"""
    recruiter = models.ForeignKey(Recruiter, on_delete=models.CASCADE, related_name='conversations')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['recruiter', 'student']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Conversation: {self.recruiter.user.username} <-> {self.student.user.username}"


class Message(models.Model):
    """Individual message in a conversation"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.created_at}"
