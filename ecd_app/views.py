from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegistrationSerializer, LoginSerializer
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

# Create your views here.
from rest_framework import viewsets
from .models import Child, Milestone, ELibrary, Activity, ProgressReport, UserProfile
from .serializers import (
    ChildSerializer, MilestoneSerializer, ELibrarySerializer,
    ActivitySerializer, ProgressReportSerializer, UserProfileSerializer
)

class ChildViewSet(viewsets.ModelViewSet):
    queryset = Child.objects.all()
    serializer_class = ChildSerializer


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer


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
        profile = getattr(user, 'profile', None)
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': getattr(profile, 'role', None),
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
    try:
        idinfo = id_token.verify_oauth2_token(credential, grequests.Request(), settings.GOOGLE_CLIENT_ID)
        email = idinfo.get('email')
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
            from .models import UserProfile
            UserProfile.objects.create(user=user, role='PARENT')

        profile = getattr(user, 'profile', None)
        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(profile, 'role', None),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)

def home(request):
    return render(request, 'home.html')  # This will render the home.html template