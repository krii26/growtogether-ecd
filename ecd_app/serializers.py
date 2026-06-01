from pathlib import Path

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Activity,
    ChatMessage,
    Child,
    ELibrary,
    FollowUpMessage,
    Milestone,
    MilestoneCategory,
    MilestoneTitle,
    ProgressReport,
    UserProfile,
)

MAX_UPLOAD_SIZE = 5 * 1024 * 1024

TEACHER_CATEGORY_BY_EMAIL = {
    'socioemo@gmail.com': 'social_emotional',
    'socio@gmail.com': 'social_emotional',
    'cognitive@gmail.com': 'cognitive',
    'congitive@gmail.com': 'cognitive',
    'physical@gmail.com': 'physical',
    'language@gmail.com': 'language',
    'selfcare@gmail.com': 'self_care_independence',
    'executive@gmail.com': 'executive_function_attention',
}


def validate_uploaded_file(uploaded_file, allowed_extensions, field_label):
    if not uploaded_file:
        return uploaded_file

    extension = Path(uploaded_file.name).suffix.lower()
    if extension not in allowed_extensions:
        allowed_list = ', '.join(sorted(allowed_extensions))
        raise serializers.ValidationError(
            f'{field_label} must be one of the following types: {allowed_list}.'
        )

    if uploaded_file.size > MAX_UPLOAD_SIZE:
        raise serializers.ValidationError(f'{field_label} must be 5MB or smaller.')

    return uploaded_file

# -----------------------------
# Child & Milestone Serializers
# -----------------------------
class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'

    def validate_image(self, value):
        return validate_uploaded_file(value, {'.jpg', '.jpeg', '.png', '.gif', '.webp'}, 'Milestone image')


class MilestoneCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MilestoneCategory
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at']


class MilestoneTitleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MilestoneTitle
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ChildSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Child
        fields = '__all__'
        read_only_fields = ['parent']

    def validate_age(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Age cannot be negative.')
        return value

    def validate_photo(self, value):
        return validate_uploaded_file(value, {'.jpg', '.jpeg', '.png', '.gif', '.webp'}, 'Child photo')


# -----------------------------
# E-Library Serializer
# -----------------------------
class ELibrarySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(required=False, allow_null=True, write_only=True)
    
    class Meta:
        model = ELibrary
        fields = [
            'id',
            'title',
            'resource_type',
            'category',
            'description',
            'image',
            'image_file',
            'file_url',
            'date_uploaded',
        ]
    
    def get_image(self, obj):
        """Return the image URL - handles both uploaded files and URL paths"""
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return obj.image  # Return the string path/URL from image field

    def validate_image_file(self, value):
        return validate_uploaded_file(value, {'.jpg', '.jpeg', '.png', '.gif', '.webp'}, 'Library image')


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
    image_url = serializers.SerializerMethodField()
    image_name = serializers.SerializerMethodField()
    document_url = serializers.SerializerMethodField()
    document_name = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'sender_name',
            'sender_role',
            'receiver_name',
            'room',
            'message',
            'image',
            'image_url',
            'image_name',
            'document',
            'document_url',
            'document_name',
            'timestamp',
        ]

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

    def get_image_name(self, obj):
        if not obj.image:
            return None
        return obj.image.name.split('/')[-1]

    def get_document_url(self, obj):
        if not obj.document:
            return None
        url = obj.document.url

        # Backward compatibility: some older chat image attachments were saved
        # in the document field but are available under Cloudinary image URLs.
        document_name = (obj.document.name or '').split('/')[-1]
        has_extension = '.' in document_name
        if '/raw/upload/' in url and not has_extension:
            url = url.replace('/raw/upload/', '/image/upload/')

        request = self.context.get('request')
        if request and not url.startswith('http'):
            return request.build_absolute_uri(url)
        return url

    def get_document_name(self, obj):
        if not obj.document:
            return None
        return obj.document.name.split('/')[-1]

    def validate(self, attrs):
        message = (attrs.get('message') or '').strip()
        image = attrs.get('image')
        document = attrs.get('document')
        if not message and not image and not document:
            raise serializers.ValidationError({'message': 'Send a text message or attach a file.'})
        return attrs

    def validate_image(self, value):
        return validate_uploaded_file(value, {'.jpg', '.jpeg', '.png', '.gif', '.webp'}, 'Chat image')

    def validate_document(self, value):
        return validate_uploaded_file(
            value,
            {'.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.txt'},
            'Chat document',
        )

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
    category = serializers.ChoiceField(choices=UserProfile.CATEGORY_CHOICES, required=False, allow_blank=True, default='')
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
        category = validated_data.get('category', '')
        phone = validated_data.get('phone_number', '')
        address = validated_data.get('address', '')

        if role == 'TEACHER' and not category:
            category = TEACHER_CATEGORY_BY_EMAIL.get((email or '').strip().lower(), '')

        # Use email as username (Django requires username field)
        user = User(username=email, email=email, first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save()

        # Create UserProfile
        UserProfile.objects.create(
            user=user,
            role=role,
            category=category,
            phone_number=phone,
            address=address
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip()
        password = attrs.get('password')

        user = None
        if '@' in email:
            user = User.objects.filter(email__iexact=email).first()
        else:
            user = User.objects.filter(username__iexact=email).first() or User.objects.filter(email__iexact=email).first()

        if not user:
            raise serializers.ValidationError({'detail': 'Invalid credentials.'})

        if not user.check_password(password):
            raise serializers.ValidationError({'detail': 'Invalid credentials.'})

        attrs['user'] = user
        return attrs