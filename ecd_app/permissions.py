from rest_framework.permissions import SAFE_METHODS, BasePermission


def resolve_user_role(user):
    if not user or not user.is_authenticated:
        return ''
    if user.is_superuser:
        return 'ADMIN'
    profile = getattr(user, 'profile', None)
    return (getattr(profile, 'role', '') or '').upper()


class RolePermission(BasePermission):
    read_roles = set()
    write_roles = set()
    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        role = resolve_user_role(request.user)
        if not role:
            return False
        allowed_roles = self.read_roles if request.method in SAFE_METHODS else self.write_roles
        return role in allowed_roles


class ChildPermission(RolePermission):
    read_roles = {'ADMIN', 'TEACHER', 'PARENT'}
    write_roles = {'ADMIN', 'PARENT'}


class MilestonePermission(RolePermission):
    read_roles = {'ADMIN', 'TEACHER', 'PARENT'}
    write_roles = {'ADMIN', 'TEACHER', 'PARENT'}


class ELibraryPermission(RolePermission):
    read_roles = {'ADMIN', 'TEACHER', 'PARENT'}
    write_roles = {'ADMIN', 'TEACHER'}


class ActivityPermission(RolePermission):
    read_roles = {'ADMIN', 'TEACHER', 'PARENT'}
    write_roles = {'ADMIN', 'TEACHER'}


class ProgressReportPermission(RolePermission):
    read_roles = {'ADMIN', 'TEACHER', 'PARENT'}
    write_roles = {'ADMIN', 'TEACHER'}


class UserProfilePermission(RolePermission):
    read_roles = {'ADMIN', 'TEACHER', 'PARENT'}
    write_roles = {'ADMIN'}


class FollowUpMessagePermission(RolePermission):
    read_roles = {'ADMIN', 'TEACHER', 'PARENT'}
    write_roles = {'ADMIN', 'TEACHER'}


class ChatMessagePermission(RolePermission):
    read_roles = {'ADMIN', 'TEACHER', 'PARENT'}
    write_roles = {'ADMIN', 'TEACHER', 'PARENT'}