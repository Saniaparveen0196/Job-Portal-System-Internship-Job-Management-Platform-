from rest_framework import serializers
from .models import Conversation, Message
from accounts.serializers import StudentProfileSerializer, RecruiterProfileSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'sender_role', 
                  'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at', 'sender']
    
    def get_sender_name(self, obj):
        if obj.sender.role == 'student':
            return f"{obj.sender.student_profile.first_name} {obj.sender.student_profile.last_name}"
        elif obj.sender.role == 'recruiter':
            return obj.sender.recruiter_profile.company_name
        return obj.sender.username
    
    def get_sender_role(self, obj):
        return obj.sender.role


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations"""
    recruiter_profile = RecruiterProfileSerializer(source='recruiter', read_only=True)
    student_profile = StudentProfileSerializer(source='student', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'recruiter', 'recruiter_profile', 'student', 'student_profile',
                  'last_message', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'sender': last_msg.sender.username,
                'created_at': last_msg.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Count unread messages for the current user
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for conversation with messages"""
    recruiter_profile = RecruiterProfileSerializer(source='recruiter', read_only=True)
    student_profile = StudentProfileSerializer(source='student', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'recruiter', 'recruiter_profile', 'student', 'student_profile',
                  'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateMessageSerializer(serializers.ModelSerializer):
    """Serializer for creating a new message"""
    student_id = serializers.IntegerField(write_only=True, required=False)
    conversation_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Message
        fields = ['conversation_id', 'student_id', 'content']
    
    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("User must be authenticated")
        
        # Recruiters must provide student_id to start a conversation
        if request.user.role == 'recruiter':
            if not attrs.get('student_id'):
                raise serializers.ValidationError("student_id is required for recruiters")
        # Students must provide conversation_id (they reply to existing conversations)
        elif request.user.role == 'student':
            if not attrs.get('conversation_id'):
                raise serializers.ValidationError("conversation_id is required for students")
        
        return attrs
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        
        conversation_id = validated_data.pop('conversation_id', None)
        student_id = validated_data.pop('student_id', None)
        content = validated_data.get('content')
        
        if user.role == 'recruiter':
            # Recruiter starting or continuing a conversation with a student
            from accounts.models import Student
            try:
                student = Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                raise serializers.ValidationError("Student not found")
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                recruiter=user.recruiter_profile,
                student=student
            )
        elif user.role == 'student':
            # Student replying to a conversation
            try:
                conversation = Conversation.objects.get(id=conversation_id, student=user.student_profile)
            except Conversation.DoesNotExist:
                raise serializers.ValidationError("Conversation not found or access denied")
        else:
            raise serializers.ValidationError("Only recruiters and students can send messages")
        
        # Create the message
        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content
        )
        
        return message
