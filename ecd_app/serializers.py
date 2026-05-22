from rest_framework import serializers
from .models import Child, Milestone, ELibrary, Activity, ProgressReport, UserProfile, FollowUpMessage, ChatMessage
from django.contrib.auth.models import User

# -----------------------------
# Child & Milestone Serializers
# -----------------------------
class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'


class ChildSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Child
        fields = '__all__'


# -----------------------------
# E-Library Serializer
# -----------------------------
class ELibrarySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ELibrary
        fields = ['id', 'title', 'resource_type', 'category', 'description', 'image', 'file_url', 'date_uploaded']
    
    def get_image(self, obj):
        """Return the image URL - handles both uploaded files and URL paths"""
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return obj.image  # Return the string path/URL from image field


# -----------------------------
# Activity Serializer
# -----------------------------
class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'title', 'description', 'age', 'duration', 'domain', 'milestone', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# -----------------------------
# Progress Report Serializer
# -----------------------------
class ProgressReportSerializer(serializers.ModelSerializer):
    milestone_completed = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = ProgressReport
        fields = '__all__'


# -----------------------------
# User Profile Serializer
# -----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'last_login', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=False)

    class Meta:
        model = UserProfile
        fields = '__all__'

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if user_data and instance.user:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        return instance


# -----------------------------
# Chat Message Serializer
# -----------------------------
class ChatMessageSerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()
    document_name = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender_name', 'sender_role', 'receiver_name', 'room', 'message', 'document', 'document_url', 'document_name', 'timestamp']

    def get_document_url(self, obj):
        if not obj.document:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.document.url)
        return obj.document.url

    def get_document_name(self, obj):
        if not obj.document:
            return None
        return obj.document.name.split('/')[-1]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if user_data:
            user = instance.user
            # Restrict writable user fields from this endpoint.
            allowed_user_fields = {'is_active', 'first_name', 'last_name'}
            for attr, value in user_data.items():
                if attr in allowed_user_fields:
                    setattr(user, attr, value)
            user.save()

        return instance


class FollowUpMessageSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.name', read_only=True)
    milestone_title = serializers.CharField(source='milestone.title', read_only=True)

    class Meta:
        model = FollowUpMessage
        fields = '__all__'

    def validate(self, attrs):
        milestone = attrs.get('milestone')
        child = attrs.get('child')

        if self.instance is None and milestone is None:
            raise serializers.ValidationError({'milestone': 'This field is required.'})

        if milestone is not None:
            if child is not None and child != milestone.child:
                raise serializers.ValidationError({'child': 'Child must match the selected milestone.'})
            attrs['child'] = milestone.child

        return attrs



class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='PARENT')
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        email = validated_data.get('email')
        password = validated_data.get('password')
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        role = validated_data.get('role', 'PARENT')
        phone = validated_data.get('phone_number', '')
        address = validated_data.get('address', '')

        # Use email as username (Django requires username field)
        user = User(username=email, email=email, first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save()

        # Create UserProfile
        profile = UserProfile.objects.create(
            user=user,
            role=role,
            phone_number=phone,
            address=address
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Invalid credentials.'})

        if not user.check_password(password):
            raise serializers.ValidationError({'detail': 'Invalid credentials.'})

        attrs['user'] = user
        return attrs