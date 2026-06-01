from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityViewSet,
    ChatMessageViewSet,
    ChildViewSet,
    ELibraryViewSet,
    FollowUpMessageViewSet,
    MilestoneViewSet,
    MilestoneCategoryViewSet,
    MilestoneTitleViewSet,
    ProgressReportViewSet,
    UserProfileViewSet,
    admin_create_account,
    assessments_collection,
    google_login,
    login,
    register,
)

router = DefaultRouter()
router.register(r'children', ChildViewSet)
router.register(r'milestones', MilestoneViewSet)
router.register(r'milestone_categories', MilestoneCategoryViewSet)
router.register(r'milestone_titles', MilestoneTitleViewSet)
router.register(r'elibrary', ELibraryViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'progress_reports', ProgressReportViewSet)
router.register(r'user_profiles', UserProfileViewSet)
router.register(r'follow_up_messages', FollowUpMessageViewSet)
router.register(r'chat_messages', ChatMessageViewSet)

urlpatterns = [
    path('register/', register, name='register'),
    path('admin-create-account/', admin_create_account, name='admin-create-account'),
    path('login/', login, name='login'),
    path('google-login/', google_login, name='google-login'),
    path('assessments/', assessments_collection, name='assessments-collection'),
    path('', include(router.urls)),
]