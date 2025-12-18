from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChildViewSet, MilestoneViewSet, ELibraryViewSet,
    ActivityViewSet, ProgressReportViewSet, UserProfileViewSet, register
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
    path('', include(router.urls)),
]