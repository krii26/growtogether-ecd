from datetime import timedelta

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Activity, Child, ELibrary, FollowUpMessage, Milestone, ProgressReport, UserProfile


def create_user_with_role(email, role, password='strong-pass-123', is_active=True, category=''):
	user = User.objects.create_user(
		username=email,
		email=email,
		password=password,
		is_active=is_active,
	)
	UserProfile.objects.create(user=user, role=role, category=category)
	return user


class ChildRiskAssessmentTests(APITestCase):
	def setUp(self):
		self.user = create_user_with_role('parent@example.com', 'PARENT')
		self.client.force_authenticate(user=self.user)
		self.child = Child.objects.create(name='Rita', parent_name='Parent Rita')

	def test_risk_assessment_high_for_overdue_without_followups(self):
		milestone = Milestone.objects.create(
			child=self.child,
			category='cognitive',
			title='Sort shapes',
			description='Sort basic shapes by type',
			date_achieved=timezone.localdate() - timedelta(days=10),
		)
		ProgressReport.objects.create(
			child=self.child,
			notes=(
				'Behavior: Sort shapes\n'
				'Category: cognitive\n'
				'Cause: Child gets distracted during sorting tasks.\n'
				'Fix Plan: Practice shape sorting in short focused sessions each day.'
			),
			overall_score=40,
		)
		Activity.objects.create(
			title='Shape sorting basket',
			description='Sort shapes in color baskets',
			domain='Cognitive',
			milestone=milestone,
		)
		ELibrary.objects.create(
			title='Helping focus in preschoolers',
			resource_type='PDF',
			category='Psychology',
			description='Daily routines and focus-building tips',
		)

		url = reverse('child-risk-assessment', args=[self.child.id])
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['risk_level'], 'HIGH')
		self.assertGreaterEqual(response.data['score'], 70)
		self.assertGreaterEqual(len(response.data['reasons']), 1)
		self.assertGreaterEqual(len(response.data['low_rated_milestones']), 1)
		self.assertGreaterEqual(len(response.data['support_recommendations']['library_resources']), 1)
		self.assertGreaterEqual(len(response.data['support_recommendations']['activity_suggestions']), 1)

	def test_risk_assessment_low_when_data_is_stable(self):
		milestone = Milestone.objects.create(
			child=self.child,
			category='physical',
			title='Hop on one foot',
			description='Balance activity',
			date_achieved=timezone.localdate() + timedelta(days=14),
		)

		FollowUpMessage.objects.create(
			child=self.child,
			milestone=self.child.milestones.first(),
			parent_name='Parent Rita',
			message='Great job, keep practicing this week.',
		)
		ProgressReport.objects.create(
			child=self.child,
			notes=(
				'Behavior: Hop on one foot\n'
				'Category: physical\n'
				'Cause: Minor wobble at first attempt.\n'
				'Fix Plan: Keep practicing with short daily balance drills.'
			),
			overall_score=85,
		)
		report = self.child.progress_reports.first()
		report.milestone_completed.add(milestone)

		url = reverse('child-risk-assessment', args=[self.child.id])
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['risk_level'], 'LOW')
		self.assertLess(response.data['score'], 40)

	def test_create_risk_followup_creates_open_item(self):
		Milestone.objects.create(
			child=self.child,
			category='social-emotional',
			title='Share toys with peers',
			description='Practice turn-taking',
			date_achieved=timezone.localdate() - timedelta(days=7),
		)

		url = reverse('child-create-risk-followup', args=[self.child.id])
		response = self.client.post(url, {}, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['status'], 'OPEN')
		self.assertEqual(FollowUpMessage.objects.filter(child=self.child).count(), 1)

	def test_high_risk_assessment_returns_support_recommendations(self):
		milestone = Milestone.objects.create(
			child=self.child,
			category='language',
			title='Use short sentences',
			description='Practice expressive language daily',
			date_achieved=timezone.localdate() - timedelta(days=9),
		)
		ProgressReport.objects.create(
			child=self.child,
			notes=(
				'Behavior: Use short sentences\n'
				'Category: language\n'
				'Cause: Limited vocabulary in daily conversation.\n'
				'Fix Plan: Use daily picture naming and story retell routines.'
			),
			overall_score=45,
		)
		Activity.objects.create(
			title='Story retell game',
			description='Ask child to retell a short story',
			domain='Language',
			milestone=milestone,
		)
		ELibrary.objects.create(
			title='Language development at home',
			resource_type='PDF',
			category='Language',
			description='Tips for parent-child language routines',
		)

		url = reverse('child-risk-assessment', args=[self.child.id])
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['risk_level'], 'HIGH')
		self.assertIn('support_recommendations', response.data)
		self.assertGreaterEqual(
			len(response.data['support_recommendations']['activity_suggestions']),
			1,
		)
		self.assertGreaterEqual(
			len(response.data['support_recommendations']['library_resources']),
			1,
		)

	def test_risk_assessment_high_when_many_milestones_are_pending(self):
		for index in range(8):
			Milestone.objects.create(
				child=self.child,
				category='cognitive',
				title=f'Cognitive target {index + 1}',
				description='Track cognitive progress',
			)

		ProgressReport.objects.create(
			child=self.child,
			notes=(
				'Behavior: Cognitive target 1\n'
				'Category: cognitive\n'
				'Cause: Still learning to maintain consistency.\n'
				'Fix Plan: Keep short guided practice sessions.'
			),
			overall_score=90,
		)

		url = reverse('child-risk-assessment', args=[self.child.id])
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['risk_level'], 'HIGH')
		self.assertGreaterEqual(response.data['metrics']['pending_milestones'], 7)


class AuthenticationApiTests(APITestCase):
	def setUp(self):
		self.password = 'secure-pass-123'
		self.user = create_user_with_role('teacher@example.com', 'TEACHER', password=self.password, category='physical')

	def test_login_returns_token_and_user_payload(self):
		response = self.client.post(
			reverse('login'),
			{'email': self.user.email, 'password': self.password},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('token', response.data)
		self.assertEqual(response.data['user']['email'], self.user.email)
		self.assertEqual(response.data['user']['role'], 'TEACHER')
		self.assertEqual(response.data['user']['category'], 'physical')


class TeacherCategoryScopeTests(APITestCase):
	def setUp(self):
		self.password = 'secure-pass-123'
		self.teacher = create_user_with_role('physical@gmail.com', 'TEACHER', password=self.password, category='physical')
		self.child = Child.objects.create(name='Scope Child', parent_name='Scope Parent')
		ProgressReport.objects.create(child=self.child, category='physical', notes='Physical progress', overall_score=80)
		ProgressReport.objects.create(child=self.child, category='cognitive', notes='Cognitive progress', overall_score=82)

	def test_teacher_only_reads_assessments_for_assigned_category(self):
		self.client.force_authenticate(user=self.teacher)

		response = self.client.get(reverse('assessments-collection'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['category'], 'physical')

	def test_teacher_create_assessment_rejects_mismatched_category(self):
		self.client.force_authenticate(user=self.teacher)

		response = self.client.post(
			reverse('assessments-collection'),
			{'child': self.child.id, 'category': 'cognitive', 'notes': 'Attempt mismatch', 'overall_score': 70},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_teacher_create_assessment_auto_assigns_category(self):
		self.client.force_authenticate(user=self.teacher)

		response = self.client.post(
			reverse('assessments-collection'),
			{'child': self.child.id, 'notes': 'No category payload', 'overall_score': 74},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['category'], 'physical')

	def test_inactive_user_cannot_log_in(self):
		inactive_user = create_user_with_role(
			'inactive@example.com',
			'PARENT',
			password=self.password,
			is_active=False,
		)

		response = self.client.post(
			reverse('login'),
			{'email': inactive_user.email, 'password': self.password},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_children_endpoint_requires_authentication(self):
		Child.objects.create(name='Unauthenticated Child')

		response = self.client.get(reverse('child-list'))

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChildOwnershipTests(APITestCase):
	def setUp(self):
		self.parent_a = create_user_with_role('parent-a@example.com', 'PARENT')
		self.parent_b = create_user_with_role('parent-b@example.com', 'PARENT')

		self.child_a = Child.objects.create(name='A Child', parent=self.parent_a, parent_name='Parent A')
		self.child_b = Child.objects.create(name='B Child', parent=self.parent_b, parent_name='Parent B')

	def test_parent_only_sees_their_own_children(self):
		self.client.force_authenticate(user=self.parent_a)

		response = self.client.get(reverse('child-list'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		returned_ids = {child['id'] for child in response.data}
		self.assertSetEqual(returned_ids, {self.child_a.id})

	def test_other_parent_only_sees_their_own_children(self):
		self.client.force_authenticate(user=self.parent_b)

		response = self.client.get(reverse('child-list'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		returned_ids = {child['id'] for child in response.data}
		self.assertSetEqual(returned_ids, {self.child_b.id})

	def test_parent_create_attaches_authenticated_user(self):
		self.client.force_authenticate(user=self.parent_a)

		response = self.client.post(
			reverse('child-list'),
			{
				'name': 'New Child',
				'parent_name': 'Parent A',
				'date_of_birth': '2021-05-01',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['parent'], self.parent_a.id)
		self.assertEqual(Child.objects.filter(parent=self.parent_a, name='New Child').count(), 1)


class PermissionTests(APITestCase):
	def setUp(self):
		self.parent = create_user_with_role('parent2@example.com', 'PARENT')
		self.teacher = create_user_with_role('teacher2@example.com', 'TEACHER')
		self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin-pass-123')
		self.child = Child.objects.create(name='Sam', parent_name='Parent Sam')
		self.profile = self.parent.profile

	def test_parent_cannot_create_progress_report(self):
		self.client.force_authenticate(user=self.parent)

		response = self.client.post(
			reverse('progressreport-list'),
			{'child': self.child.id, 'notes': 'Update', 'overall_score': 88},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_teacher_can_create_progress_report(self):
		self.client.force_authenticate(user=self.teacher)

		response = self.client.post(
			reverse('progressreport-list'),
			{'child': self.child.id, 'notes': 'Steady progress', 'overall_score': 91},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

	def test_only_admin_can_disable_user(self):
		self.client.force_authenticate(user=self.teacher)

		forbidden_response = self.client.post(
			reverse('userprofile-set-active', args=[self.profile.id]),
			{'is_active': False},
			format='json',
		)

		self.assertEqual(forbidden_response.status_code, status.HTTP_403_FORBIDDEN)

		self.client.force_authenticate(user=self.admin)
		allowed_response = self.client.post(
			reverse('userprofile-set-active', args=[self.profile.id]),
			{'is_active': False},
			format='json',
		)

		self.assertEqual(allowed_response.status_code, status.HTTP_200_OK)
		self.parent.refresh_from_db()
		self.assertFalse(self.parent.is_active)


class UploadValidationTests(APITestCase):
	def setUp(self):
		self.teacher = create_user_with_role('teacher3@example.com', 'TEACHER')
		self.client.force_authenticate(user=self.teacher)

	def test_chat_messages_reject_disallowed_file_types(self):
		payload = {
			'sender_name': 'Teacher',
			'sender_role': 'TEACHER',
			'receiver_name': 'Parent',
			'room': 'user:1||user:2',
			'document': SimpleUploadedFile('malware.exe', b'fake-binary', content_type='application/octet-stream'),
		}

		response = self.client.post(reverse('chatmessage-list'), payload)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('document', response.data)
