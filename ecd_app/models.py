from django.db import models
from django.contrib.auth.models import User

# -----------------------------
# Child & Milestones
# -----------------------------
class Child(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField(null=True, blank=True)
    parent_name = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to='child_photos/', null=True, blank=True)
    date_registered = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name


class Milestone(models.Model):
    CATEGORY_CHOICES = (
        ('social-emotional', 'Social-Emotional'),
        ('cognitive', 'Cognitive'),
        ('physical', 'Physical'),
        ('language', 'Language'),
    )
    
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='milestones')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='social-emotional')
    title = models.CharField(max_length=100)
    description = models.TextField()
    date_achieved = models.DateField(null=True, blank=True)
    image = models.ImageField(upload_to='milestone_images/', null=True, blank=True)

    def __str__(self):
        return f"{self.child.name} - {self.title}"
    
    class Meta:
        ordering = ['category', 'title']


# -----------------------------
# E-Library
# -----------------------------
class ELibrary(models.Model):
    RESOURCE_TYPES = (
        ('PDF', 'PDF'),
        ('VIDEO', 'Video'),
        ('IMAGE', 'Image'),
        ('DOC', 'Document'),
    )
    
    CATEGORIES = (
        ('Nutrition', 'Nutrition'),
        ('Psychology', 'Psychology'),
        ('Behavior', 'Behavior'),
        ('Sleep', 'Sleep'),
        ('Language', 'Language'),
        ('Safety', 'Safety'),
    )

    title = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    category = models.CharField(max_length=50, choices=CATEGORIES, default='Nutrition')
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True, null=True)  # Image URL/path (supports both local paths and external URLs)
    image_file = models.ImageField(upload_to='library_images/', blank=True, null=True)  # For uploaded images
    file_url = models.URLField(blank=True, null=True)  # Can store file link or cloud URL
    date_uploaded = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title
    
    def get_image_url(self):
        """Return the image URL - either from uploaded file or from image field"""
        if self.image_file:
            return self.image_file.url
        return self.image


# -----------------------------
# Activity Suggestions
# -----------------------------
class Activity(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    recommended_age = models.IntegerField(help_text="Suggested age in years")
    milestone = models.ForeignKey(Milestone, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')

    def __str__(self):
        return self.name


# -----------------------------
# Progress Reports
# -----------------------------
class ProgressReport(models.Model):
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='progress_reports')
    report_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    milestone_completed = models.ManyToManyField(Milestone, blank=True)
    overall_score = models.IntegerField(null=True, blank=True, help_text="Optional score representing progress")

    def __str__(self):
        return f"{self.child.name} - {self.report_date}"


# -----------------------------
# User Profile / Roles
# -----------------------------
class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('TEACHER', 'Teacher'),
        ('PARENT', 'Parent'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
