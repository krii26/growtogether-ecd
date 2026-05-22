from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, action as viewset_action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets
from .serializers import RegistrationSerializer, LoginSerializer
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

# Create your views here.
from .models import Child, Milestone, ELibrary, Activity, ProgressReport, UserProfile, FollowUpMessage, ChatMessage
from .serializers import (
    ChildSerializer, MilestoneSerializer, ELibrarySerializer,
    ActivitySerializer, ProgressReportSerializer, UserProfileSerializer,
    FollowUpMessageSerializer, ChatMessageSerializer
)


def get_or_create_login_profile(user):
    if user.is_superuser:
        return None

    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={'role': 'PARENT'}
    )
    return profile

class ChildViewSet(viewsets.ModelViewSet):
    queryset = Child.objects.all()
    serializer_class = ChildSerializer


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer

    def get_queryset(self):
        queryset = Milestone.objects.all()
        child_id = self.request.query_params.get('child')
        if child_id:
            queryset = queryset.filter(child_id=child_id)
        return queryset


class ELibraryViewSet(viewsets.ModelViewSet):
    queryset = ELibrary.objects.all()
    serializer_class = ELibrarySerializer


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer


class ProgressReportViewSet(viewsets.ModelViewSet):
    queryset = ProgressReport.objects.all()
    serializer_class = ProgressReportSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        queryset = UserProfile.objects.select_related('user').all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role.upper())
        return queryset

    @viewset_action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        profile = self.get_object()
        is_active = request.data.get('is_active')
        if is_active is None:
            return Response({'error': 'is_active required'}, status=status.HTTP_400_BAD_REQUEST)
        profile.user.is_active = bool(is_active)
        profile.user.save(update_fields=['is_active'])
        return Response({'is_active': profile.user.is_active})

    @viewset_action(detail=True, methods=['delete'])
    def delete_user(self, request, pk=None):
        profile = self.get_object()
        profile.user.delete()  # cascade deletes profile too
        return Response(status=status.HTTP_204_NO_CONTENT)


class FollowUpMessageViewSet(viewsets.ModelViewSet):
    queryset = FollowUpMessage.objects.all()
    serializer_class = FollowUpMessageSerializer


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        queryset = ChatMessage.objects.all()
        room = self.request.query_params.get('room')
        participant = self.request.query_params.get('participant')
        if room:
            queryset = queryset.filter(room=room)
        elif participant:
            queryset = queryset.filter(room__icontains=participant)
        return queryset

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {'id': user.id, 'username': user.username, 'email': user.email},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        profile = get_or_create_login_profile(user)
        role = 'SUPER_ADMIN' if user.is_superuser else getattr(profile, 'role', None)
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': role,
            },
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    credential = request.data.get('credential')
    if not credential:
        return Response({'detail': 'Missing credential'}, status=status.HTTP_400_BAD_REQUEST)
    if not settings.GOOGLE_CLIENT_ID:
        return Response({'detail': 'Google login is not configured on server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    try:
        # Allow limited clock skew so minor local time drift does not reject valid tokens.
        idinfo = id_token.verify_oauth2_token(
            credential,
            grequests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=120,
        )
        email = idinfo.get('email')
        if not email:
            return Response({'detail': 'Google account email is missing'}, status=status.HTTP_400_BAD_REQUEST)
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        from django.contrib.auth.models import User
        user, created = User.objects.get_or_create(email=email, defaults={
            'username': email,
            'first_name': first_name,
            'last_name': last_name,
        })
        if created:
            # Create a profile with default role
            UserProfile.objects.create(user=user, role='PARENT')

        profile = get_or_create_login_profile(user)
        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(profile, 'role', None),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        if settings.DEBUG:
            return Response({'detail': f'Invalid Google token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)

def home(request):
    return render(request, 'home.html')  # This will render the home.html template