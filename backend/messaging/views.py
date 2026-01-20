from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, ConversationDetailSerializer,
    MessageSerializer, CreateMessageSerializer
)
from accounts.permissions import IsStudent, IsRecruiter, IsApprovedRecruiter


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing conversations"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'recruiter':
            return Conversation.objects.filter(recruiter=user.recruiter_profile).select_related(
                'student', 'student__user', 'recruiter', 'recruiter__user'
            )
        elif user.role == 'student':
            return Conversation.objects.filter(student=user.student_profile).select_related(
                'student', 'student__user', 'recruiter', 'recruiter__user'
            )
        return Conversation.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark all messages in a conversation as read"""
        conversation = self.get_object()
        # Mark all messages not sent by current user as read
        Message.objects.filter(
            conversation=conversation
        ).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'messages marked as read'})


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing messages"""
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'recruiter':
            # Recruiters can see messages in their conversations
            return Message.objects.filter(conversation__recruiter=user.recruiter_profile)
        elif user.role == 'student':
            # Students can see messages in their conversations
            return Message.objects.filter(conversation__student=user.student_profile)
        return Message.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateMessageSerializer
        return MessageSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        # Only mark as read if the current user is not the sender
        if message.sender != request.user:
            message.is_read = True
            message.save()
        return Response({'status': 'message marked as read'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """Get count of unread messages for the current user"""
    user = request.user
    if user.role == 'recruiter':
        count = Message.objects.filter(
            conversation__recruiter=user.recruiter_profile,
            is_read=False
        ).exclude(sender=user).count()
    elif user.role == 'student':
        count = Message.objects.filter(
            conversation__student=user.student_profile,
            is_read=False
        ).exclude(sender=user).count()
    else:
        count = 0
    
    return Response({'unread_count': count})
