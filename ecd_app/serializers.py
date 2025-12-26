from rest_framework import serializers
from .models import Child, Milestone, ELibrary, Activity, ProgressReport, UserProfile
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
    class Meta:
        model = ELibrary
        fields = '__all__'


# -----------------------------
# Activity Serializer
# -----------------------------
class ActivitySerializer(serializers.ModelSerializer):
    milestone = MilestoneSerializer(read_only=True)

    class Meta:
        model = Activity
        fields = '__all__'


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
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'



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