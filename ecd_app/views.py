import re
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import render
from django.utils import timezone
from google.auth.transport import requests as grequests
from google.oauth2 import id_token
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action as viewset_action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# Create your views here.
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
from .permissions import (
    ActivityPermission,
    ChatMessagePermission,
    ChildPermission,
    ELibraryPermission,
    FollowUpMessagePermission,
    MilestonePermission,
    MilestoneCategoryPermission,
    MilestoneTitlePermission,
    ProgressReportPermission,
    UserProfilePermission,
    resolve_user_role,
)
from .serializers import (
    ActivitySerializer,
    ChatMessageSerializer,
    ChildSerializer,
    ELibrarySerializer,
    FollowUpMessageSerializer,
    LoginSerializer,
    MilestoneSerializer,
    MilestoneCategorySerializer,
    MilestoneTitleSerializer,
    ProgressReportSerializer,
    RegistrationSerializer,
    UserProfileSerializer,
)


def get_or_create_login_profile(user):
    if user.is_superuser:
        return None

    default_role = 'TEACHER' if user.is_staff else 'PARENT'

    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={'role': default_role}
    )

    # Backward compatibility: older logins could create staff users as PARENT.
    if user.is_staff and profile.role == 'PARENT':
        profile.role = 'TEACHER'
        profile.save(update_fields=['role'])

    return profile


CATEGORY_NORMALIZATION = {
    'social-emotional': 'social_emotional',
    'social_emotional': 'social_emotional',
    'cognitive': 'cognitive',
    'physical': 'physical',
    'language': 'language',
    'self-care': 'self_care_independence',
    'self-care-independence': 'self_care_independence',
    'self_care': 'self_care_independence',
    'self_care_independence': 'self_care_independence',
    'executive-function': 'executive_function_attention',
    'executive-function-attention': 'executive_function_attention',
    'executive_function': 'executive_function_attention',
    'executive_function_attention': 'executive_function_attention',
}

TEACHER_CATEGORY_TO_MILESTONE_CATEGORIES = {
    'social_emotional': ['social-emotional'],
    'cognitive': ['cognitive'],
    'physical': ['physical'],
    'language': ['language'],
    'self_care_independence': ['self-care'],
    'executive_function_attention': ['executive-function'],
}


def normalize_teacher_category(value):
    if not value:
        return ''
    return CATEGORY_NORMALIZATION.get(str(value).strip().lower(), '')


def get_teacher_category(user):
    profile = getattr(user, 'profile', None)
    return normalize_teacher_category(getattr(profile, 'category', ''))


def filter_progress_reports_for_user(user, queryset=None):
    queryset = queryset or ProgressReport.objects.select_related('child').prefetch_related('milestone_completed').all()
    role = resolve_user_role(user)
    if role != 'TEACHER':
        return queryset

    teacher_category = get_teacher_category(user)
    if not teacher_category:
        return queryset.none()
    return queryset.filter(category=teacher_category)

class ChildViewSet(viewsets.ModelViewSet):
    queryset = Child.objects.select_related('parent').prefetch_related('milestones', 'progress_reports', 'follow_up_messages').all()
    serializer_class = ChildSerializer
    permission_classes = [ChildPermission]

    _MILESTONE_TO_ACTIVITY_DOMAINS = {
        'social-emotional': ['Social-Emotional'],
        'cognitive': ['Cognitive', 'Science'],
        'physical': ['Physical', 'Fine Motor', 'Math + Physical'],
        'language': ['Language'],
        'self-care': ['Fine Motor', 'Physical'],
        'executive-function': ['Cognitive', 'Science'],
    }

    _MILESTONE_TO_LIBRARY_CATEGORIES = {
        'social-emotional': ['Behavior', 'Psychology'],
        'cognitive': ['Psychology', 'Language'],
        'physical': ['Nutrition', 'Safety'],
        'language': ['Language', 'Psychology'],
        'self-care': ['Safety', 'Nutrition'],
        'executive-function': ['Psychology', 'Behavior'],
    }

    def _normalize_name(self, value):
        return ' '.join((value or '').split()).strip().lower()

    def _resolve_parent_user(self, parent_name):
        normalized_parent_name = self._normalize_name(parent_name)
        if not normalized_parent_name:
            return None

        for user in User.objects.filter(is_active=True):
            user_candidates = {
                self._normalize_name(user.get_full_name()),
                self._normalize_name(user.username),
                self._normalize_name(user.email),
                self._normalize_name(f'{user.first_name} {user.last_name}'),
            }
            if normalized_parent_name in user_candidates:
                return user

        return None

    def get_queryset(self):
        queryset = super().get_queryset()
        if resolve_user_role(self.request.user) == 'PARENT':
            queryset = queryset.filter(parent=self.request.user)
        return queryset

    def perform_create(self, serializer):
        role = resolve_user_role(self.request.user)
        if role == 'PARENT':
            serializer.save(parent=self.request.user)
            return

        parent_name = self.request.data.get('parent_name')
        parent_user = self._resolve_parent_user(parent_name)
        if parent_user:
            serializer.save(parent=parent_user)
            return

        serializer.save()

    def perform_update(self, serializer):
        role = resolve_user_role(self.request.user)
        if role == 'PARENT':
            serializer.save(parent=self.request.user)
            return

        parent_name = self.request.data.get('parent_name')
        parent_user = self._resolve_parent_user(parent_name)
        if parent_user:
            serializer.save(parent=parent_user)
            return

        serializer.save()

    def _extract_notes_sections(self, notes):
        text = (notes or '').strip()
        if not text:
            return {
                'title': '',
                'category': '',
                'cause': '',
                'fix': '',
            }

        patterns = {
            'title': r'Behavior:\s*(.*)',
            'category': r'Category:\s*(.*)',
            'cause': r'Cause:\s*(.*)',
            'fix': r'Fix Plan:\s*(.*)',
        }

        result = {'title': '', 'category': '', 'cause': '', 'fix': ''}
        for key, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                result[key] = (match.group(1) or '').strip()

        # Backward compatibility for old notes format using only Suggestions.
        if not result['cause']:
            match = re.search(r'Suggestions:\s*(.*)', text, re.IGNORECASE | re.DOTALL)
            if match:
                result['cause'] = (match.group(1) or '').strip()

        if not result['fix']:
            result['fix'] = result['cause'] or 'Use targeted guided practice and repeat activities at home.'

        return result

    def _recommend_from_low_ratings(self, active_milestones, low_rated_items):
        if not active_milestones.exists():
            return None

        for item in low_rated_items:
            category = (item.get('category') or '').strip().lower()
            if category:
                milestone = active_milestones.filter(category=category).order_by('id').first()
                if milestone:
                    return milestone

            title = (item.get('title') or '').strip().lower()
            if title:
                milestone = active_milestones.filter(title__icontains=title[:40]).order_by('id').first()
                if milestone:
                    return milestone

        return active_milestones.order_by('id').first()

    def _build_support_recommendations(self, recommended_milestone):
        if recommended_milestone is None:
            return {
                'library_resources': [],
                'activity_suggestions': [],
            }

        milestone_category = (recommended_milestone.category or '').strip().lower()
        library_categories = self._MILESTONE_TO_LIBRARY_CATEGORIES.get(milestone_category, [])
        activity_domains = self._MILESTONE_TO_ACTIVITY_DOMAINS.get(milestone_category, [])

        activities_qs = Activity.objects.none()
        if activity_domains:
            activities_qs = Activity.objects.filter(domain__in=activity_domains)

        activity_candidates = Activity.objects.filter(milestone=recommended_milestone)
        activities_qs = (activity_candidates | activities_qs).distinct().order_by('-updated_at', '-id')[:3]

        library_qs = ELibrary.objects.none()
        if library_categories:
            library_qs = ELibrary.objects.filter(category__in=library_categories)

        library_resources = list(library_qs.order_by('-date_uploaded', '-id')[:3])
        activity_suggestions = list(activities_qs)

        if not library_resources:
            library_resources = list(ELibrary.objects.order_by('-date_uploaded', '-id')[:3])

        if not activity_suggestions:
            activity_suggestions = list(Activity.objects.order_by('-updated_at', '-id')[:3])

        return {
            'library_resources': ELibrarySerializer(
                library_resources,
                many=True,
                context={'request': self.request},
            ).data,
            'activity_suggestions': ActivitySerializer(activity_suggestions, many=True).data,
        }

    def _build_risk_assessment(self, child):
        milestones = child.milestones.all()
        total_active_milestones = milestones.count()

        reports = child.progress_reports.order_by('-report_date', '-id')
        scored_reports = [r for r in reports if r.overall_score is not None]
        completed_milestones = len(scored_reports)
        pending_milestones = max(total_active_milestones - completed_milestones, 0)
        completion_ratio = (
            (completed_milestones / total_active_milestones)
            if total_active_milestones > 0
            else 0
        )

        average_score = 0
        if completed_milestones > 0:
            average_score = sum(r.overall_score for r in scored_reports) / completed_milestones

        low_rated_reports = [r for r in scored_reports if r.overall_score < 60]
        low_rated_count = len(low_rated_reports)
        low_ratio = (low_rated_count / completed_milestones) if completed_milestones else 0

        recent_followups_count = child.follow_up_messages.filter(
            created_at__gte=timezone.now() - timedelta(days=14)
        ).count()

        score = 5
        reasons = []

        low_rated_items = []
        for report in low_rated_reports[:3]:
            parsed = self._extract_notes_sections(report.notes)
            low_rated_items.append(
                {
                    'progress_report_id': report.id,
                    'title': parsed['title'] or 'Milestone performance item',
                    'category': parsed['category'] or '',
                    'rating': int(round((report.overall_score or 0) / 10)),
                    'score': report.overall_score,
                    'cause': parsed['cause'] or 'Performance trend is below expected target.',
                    'fix': parsed['fix'],
                }
            )

        if completed_milestones == 0:
            score += 60
            reasons.append('No completed milestone ratings are available yet.')
        else:
            if average_score < 50:
                score += 35
                reasons.append(f'Average completed milestone score is low ({average_score:.1f}/100).')
            elif average_score < 70:
                score += 20
                reasons.append(f'Average completed milestone score is moderate ({average_score:.1f}/100).')

            low_points = int(low_ratio * 30)
            score += low_points
            if low_rated_count > 0:
                reasons.append(
                    f'{low_rated_count} of {completed_milestones} completed milestones were rated below 6/10.'
                )

        # Coverage guardrail: good ratings on only a few completed milestones
        # should not hide risk when many milestones remain pending.
        if total_active_milestones >= 4 and completion_ratio < 0.5:
            score += 40
            reasons.append(
                f'Only {completed_milestones} of {total_active_milestones} milestones have been rated so far.'
            )
        elif total_active_milestones >= 2 and completion_ratio < 0.7:
            score += 12
            reasons.append(
                f'Milestone coverage is limited ({completed_milestones}/{total_active_milestones} rated).'
            )

        if pending_milestones >= 6:
            score += 15
            reasons.append('Several milestones are still pending and need closer tracking.')

        latest_report = reports.first()
        if latest_report and latest_report.report_date:
            days_since_report = (timezone.localdate() - latest_report.report_date).days
            if days_since_report > 45:
                score += 15
                reasons.append(f'No recent progress update in {days_since_report} days.')
            elif days_since_report > 30:
                score += 8
                reasons.append('Progress updates are becoming infrequent.')

        if recent_followups_count == 0:
            score += 10
            reasons.append('No follow-up messages were sent in the last 14 days.')

        if total_active_milestones >= 8:
            score += 5
            reasons.append('High active milestone load may need closer monitoring.')

        if not reasons:
            reasons.append('Milestones and follow-ups look stable based on current data.')

        score = max(0, min(100, score))

        if score >= 70:
            risk_level = 'HIGH'
        elif score >= 40:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'

        recommended_milestone = self._recommend_from_low_ratings(milestones, low_rated_items)

        support_recommendations = {'library_resources': [], 'activity_suggestions': []}
        if risk_level == 'HIGH':
            support_recommendations = self._build_support_recommendations(recommended_milestone)

        return {
            'child_id': child.id,
            'child_name': child.name,
            'score': score,
            'risk_level': risk_level,
            'reasons': reasons[:3],
            'metrics': {
                'total_active_milestones': total_active_milestones,
                'completed_milestones': completed_milestones,
                'pending_milestones': pending_milestones,
                'completion_ratio': round(completion_ratio, 2),
                'average_completed_score': round(average_score, 2),
                'low_rated_completed_milestones': low_rated_count,
                'recent_followups_14d': recent_followups_count,
            },
            'low_rated_milestones': low_rated_items,
            'recommended_milestone_id': recommended_milestone.id if recommended_milestone else None,
            'recommended_milestone_title': recommended_milestone.title if recommended_milestone else None,
            'recommended_milestone_category': recommended_milestone.category if recommended_milestone else None,
            'support_recommendations': support_recommendations,
        }

    @viewset_action(detail=True, methods=['get'])
    def risk_assessment(self, request, pk=None):
        child = self.get_object()
        return Response(self._build_risk_assessment(child), status=status.HTTP_200_OK)

    @viewset_action(detail=True, methods=['post'], permission_classes=[FollowUpMessagePermission])
    def create_risk_followup(self, request, pk=None):
        child = self.get_object()
        assessment = self._build_risk_assessment(child)

        milestone_id = assessment.get('recommended_milestone_id')
        if not milestone_id:
            return Response(
                {'error': 'Cannot create follow-up because this child has no milestones yet.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone = child.milestones.filter(id=milestone_id).first()
        if milestone is None:
            return Response(
                {'error': 'Recommended milestone is no longer available.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        custom_message = (request.data.get('message') or '').strip()
        message = custom_message or (
            f"Risk alert for {child.name}: current risk level is {assessment['risk_level']} "
            f"(score {assessment['score']}/100). "
            f"Top factors: {'; '.join(assessment['reasons'])}. "
            "Please review and support this milestone at home."
        )

        followup = FollowUpMessage.objects.create(
            child=child,
            milestone=milestone,
            parent_name=child.parent_name or 'Parent',
            message=message,
        )

        return Response(
            {
                'id': followup.id,
                'status': 'OPEN',
                'child': child.id,
                'milestone': milestone.id,
                'message': followup.message,
                'created_at': followup.created_at,
            },
            status=status.HTTP_201_CREATED,
        )

    @viewset_action(detail=False, methods=['get'], url_path='assessments', permission_classes=[ProgressReportPermission])
    def assessments(self, request):
        reports = filter_progress_reports_for_user(request.user)
        serializer = ProgressReportSerializer(reports.order_by('-report_date', '-id'), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.select_related('child').all()
    serializer_class = MilestoneSerializer
    permission_classes = [MilestonePermission]

    def get_queryset(self):
        queryset = Milestone.objects.select_related('child').all()
        if resolve_user_role(self.request.user) == 'TEACHER':
            teacher_category = get_teacher_category(self.request.user)
            allowed_categories = TEACHER_CATEGORY_TO_MILESTONE_CATEGORIES.get(teacher_category, [])
            if not allowed_categories:
                return queryset.none()
            queryset = queryset.filter(category__in=allowed_categories)
        child_id = self.request.query_params.get('child')
        if child_id:
            queryset = queryset.filter(child_id=child_id)
        return queryset

    def perform_create(self, serializer):
        if resolve_user_role(self.request.user) != 'TEACHER':
            serializer.save()
            return

        teacher_category = get_teacher_category(self.request.user)
        allowed_categories = TEACHER_CATEGORY_TO_MILESTONE_CATEGORIES.get(teacher_category, [])
        if not allowed_categories:
            raise PermissionDenied('Teacher category is not configured. Contact an admin.')

        requested_category = normalize_teacher_category(self.request.data.get('category'))
        if requested_category and requested_category != teacher_category:
            raise PermissionDenied('You can only create milestones in your assigned category.')

        serializer.save(category=allowed_categories[0])


class MilestoneCategoryViewSet(viewsets.ModelViewSet):
    queryset = MilestoneCategory.objects.all()
    serializer_class = MilestoneCategorySerializer
    permission_classes = [MilestoneCategoryPermission]


class MilestoneTitleViewSet(viewsets.ModelViewSet):
    queryset = MilestoneTitle.objects.select_related('category').all()
    serializer_class = MilestoneTitleSerializer
    permission_classes = [MilestoneTitlePermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_update(self, serializer):
        if resolve_user_role(self.request.user) != 'TEACHER':
            serializer.save()
            return

        teacher_category = get_teacher_category(self.request.user)
        allowed_categories = TEACHER_CATEGORY_TO_MILESTONE_CATEGORIES.get(teacher_category, [])
        if not allowed_categories:
            raise PermissionDenied('Teacher category is not configured. Contact an admin.')

        requested_category = normalize_teacher_category(self.request.data.get('category'))
        if requested_category and requested_category != teacher_category:
            raise PermissionDenied('You can only update milestones in your assigned category.')

        serializer.save(category=allowed_categories[0])


class ELibraryViewSet(viewsets.ModelViewSet):
    queryset = ELibrary.objects.all()
    serializer_class = ELibrarySerializer
    permission_classes = [ELibraryPermission]


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.select_related('milestone').all()
    serializer_class = ActivitySerializer
    permission_classes = [ActivityPermission]


class ProgressReportViewSet(viewsets.ModelViewSet):
    queryset = ProgressReport.objects.select_related('child').prefetch_related('milestone_completed').all()
    serializer_class = ProgressReportSerializer
    permission_classes = [ProgressReportPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        return filter_progress_reports_for_user(self.request.user, queryset)

    def perform_create(self, serializer):
        if resolve_user_role(self.request.user) != 'TEACHER':
            serializer.save()
            return

        teacher_category = get_teacher_category(self.request.user)
        if not teacher_category:
            raise PermissionDenied('Teacher category is not configured. Contact an admin.')

        requested_category = normalize_teacher_category(self.request.data.get('category'))
        if requested_category and requested_category != teacher_category:
            raise PermissionDenied('You can only create assessments in your assigned category.')

        serializer.save(category=teacher_category)

    def perform_update(self, serializer):
        if resolve_user_role(self.request.user) != 'TEACHER':
            serializer.save()
            return

        teacher_category = get_teacher_category(self.request.user)
        if not teacher_category:
            raise PermissionDenied('Teacher category is not configured. Contact an admin.')

        requested_category = normalize_teacher_category(self.request.data.get('category'))
        if requested_category and requested_category != teacher_category:
            raise PermissionDenied('You can only update assessments in your assigned category.')

        serializer.save(category=teacher_category)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [UserProfilePermission]

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
        user = profile.user

        full_name = f"{(user.first_name or '').strip()} {(user.last_name or '').strip()}".strip()
        username = (user.username or '').strip()
        email = (user.email or '').strip()

        name_candidates = {value for value in [full_name, username, email] if value}

        children_qs = Child.objects.none()
        for candidate in name_candidates:
            children_qs = children_qs | Child.objects.filter(parent_name__iexact=candidate)

        children_qs = children_qs.distinct()
        deleted_child_ids = list(children_qs.values_list('id', flat=True))
        deleted_children_count = len(deleted_child_ids)

        if deleted_children_count:
            Child.objects.filter(id__in=deleted_child_ids).delete()

        profile.user.delete()  # cascade deletes profile too
        return Response(
            {
                'deleted_children_count': deleted_children_count,
                'deleted_child_ids': deleted_child_ids,
            },
            status=status.HTTP_200_OK,
        )


class FollowUpMessageViewSet(viewsets.ModelViewSet):
    queryset = FollowUpMessage.objects.select_related('child', 'milestone').all()
    serializer_class = FollowUpMessageSerializer
    permission_classes = [FollowUpMessagePermission]


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [ChatMessagePermission]
    http_method_names = ['get', 'post', 'head', 'options']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = ChatMessage.objects.all()
        room = self.request.query_params.get('room')
        participant = self.request.query_params.get('participant')
        if room:
            queryset = queryset.filter(room=room)
        elif participant:
            queryset = queryset.filter(room__icontains=participant)
        return queryset


@api_view(['GET', 'POST'])
@permission_classes([ProgressReportPermission])
def assessments_collection(request):
    if request.method == 'GET':
        reports = filter_progress_reports_for_user(request.user)
        serializer = ProgressReportSerializer(reports.order_by('-report_date', '-id'), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = ProgressReportSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    if resolve_user_role(request.user) == 'TEACHER':
        teacher_category = get_teacher_category(request.user)
        if not teacher_category:
            raise PermissionDenied('Teacher category is not configured. Contact an admin.')

        requested_category = normalize_teacher_category(request.data.get('category'))
        if requested_category and requested_category != teacher_category:
            raise PermissionDenied('You can only create assessments in your assigned category.')

        serializer.save(category=teacher_category)
    else:
        serializer.save()

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    payload = {**request.data, 'role': 'PARENT'}
    serializer = RegistrationSerializer(data=payload)
    if serializer.is_valid():
        user = serializer.save()
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        profile = get_or_create_login_profile(user)
        user_payload = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(profile, 'role', None),
            'category': getattr(profile, 'category', ''),
        }
        return Response(
            {
                'token': token.key,
                'user': user_payload,
                **user_payload,
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        if not user.is_active:
            return Response({'detail': 'This account is inactive.'}, status=status.HTTP_403_FORBIDDEN)
        profile = get_or_create_login_profile(user)
        role = 'SUPER_ADMIN' if user.is_superuser else getattr(profile, 'role', None)
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        user_payload = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role,
            'category': getattr(profile, 'category', ''),
        }
        return Response(
            {
                'token': token.key,
                'user': user_payload,
                **user_payload,
            },
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def admin_create_account(request):
    if resolve_user_role(request.user) != 'ADMIN':
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    role = (request.data.get('role') or '').strip().upper()
    if role not in {'PARENT', 'TEACHER'}:
        return Response({'role': 'Role must be PARENT or TEACHER.'}, status=status.HTTP_400_BAD_REQUEST)

    payload = {**request.data, 'role': role}
    serializer = RegistrationSerializer(data=payload)
    if serializer.is_valid():
        user = serializer.save()
        profile = get_or_create_login_profile(user)
        user_payload = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(profile, 'role', None),
            'category': getattr(profile, 'category', ''),
        }
        return Response(
            {
                'user': user_payload,
                **user_payload,
            },
            status=status.HTTP_201_CREATED,
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
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        user_payload = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(profile, 'role', None),
            'category': getattr(profile, 'category', ''),
        }
        return Response({
            'token': token.key,
            'user': user_payload,
            **user_payload,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        if settings.DEBUG:
            return Response({'detail': f'Invalid Google token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)

def home(request):
    return render(request, 'home.html')  # This will render the home.html template


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response(
        {
            'status': 'ok',
            'service': 'GrowTogether API',
            'timestamp': timezone.now(),
        },
        status=status.HTTP_200_OK,
    )