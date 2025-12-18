from django.contrib import admin
from .models import Child, Milestone, ELibrary, Activity, ProgressReport, UserProfile

admin.site.register(Child)
admin.site.register(Milestone)
admin.site.register(ELibrary)
admin.site.register(Activity)
admin.site.register(ProgressReport)
admin.site.register(UserProfile)

