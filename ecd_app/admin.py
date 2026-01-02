from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Child, Milestone, ELibrary, Activity, ProgressReport, UserProfile

# Custom User Admin to show role/user status
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_user_status')
    list_select_related = ('profile',)
    
    def get_user_status(self, obj):
        """Display the user's role from their profile"""
        try:
            if obj.is_superuser:
                return 'ADMIN'
            return obj.profile.role
        except UserProfile.DoesNotExist:
            return 'No Role Set'
    
    get_user_status.short_description = 'USER STATUS'
    
    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)

# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Register other models
admin.site.register(Child)
admin.site.register(Milestone)
admin.site.register(ELibrary)
admin.site.register(Activity)
admin.site.register(ProgressReport)
admin.site.register(UserProfile)

