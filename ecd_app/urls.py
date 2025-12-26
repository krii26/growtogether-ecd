from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChildViewSet, MilestoneViewSet, ELibraryViewSet,
    ActivityViewSet, ProgressReportViewSet, UserProfileViewSet, register, login, google_login
)

router = DefaultRouter()
router.register(r'children', ChildViewSet)
router.register(r'milestones', MilestoneViewSet)
router.register(r'elibrary', ELibraryViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'progress_reports', ProgressReportViewSet)
router.register(r'user_profiles', UserProfileViewSet)

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('google-login/', google_login),
    path('', include(router.urls)),
]