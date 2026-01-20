from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Student, Recruiter


class UserSerializer(serializers.ModelSerializer):
    """User serializer"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class StudentSignupSerializer(serializers.ModelSerializer):
    """Student signup serializer"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirm Password')
    username = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=17)
    
    class Meta:
        model = Student
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 
                  'phone_number', 'bio', 'skills', 'education', 'experience', 'location']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        phone_number = validated_data.pop('phone_number', '')
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='student',
            phone_number=phone_number
        )
        
        student = Student.objects.create(user=user, **validated_data)
        return student


class RecruiterSignupSerializer(serializers.ModelSerializer):
    """Recruiter signup serializer"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirm Password')
    username = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=17)
    company_website = serializers.URLField(required=False, allow_blank=True)
    
    class Meta:
        model = Recruiter
        fields = ['username', 'email', 'password', 'password2', 'company_name', 
                  'company_description', 'company_website', 'location', 'phone_number']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        phone_number = validated_data.pop('phone_number', '')
        
        # Convert empty string to None for company_website
        company_website = validated_data.get('company_website', '')
        if company_website == '':
            validated_data['company_website'] = None
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='recruiter',
            phone_number=phone_number
        )
        
        recruiter = Recruiter.objects.create(user=user, **validated_data)
        return recruiter


class StudentProfileSerializer(serializers.ModelSerializer):
    """Student profile serializer"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'first_name', 'last_name', 'bio', 'skills', 
                  'education', 'experience', 'location', 'profile_picture', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    """Recruiter profile serializer"""
    user = UserSerializer(read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Recruiter
        fields = ['id', 'user', 'company_name', 'company_description', 'company_website',
                  'company_logo', 'location', 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_approved', 'created_at', 'updated_at']
