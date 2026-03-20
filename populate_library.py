import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from ecd_app.models import ELibrary

# Clear existing resources (optional)
print("Clearing existing E-Library resources...")
ELibrary.objects.all().delete()

# Define the 6 resources
resources = [
    {
        'title': 'Healthy Eating for Toddlers',
        'category': 'Nutrition',
        'resource_type': 'PDF',
        'description': 'Essential nutrition guidelines and meal planning tips for children aged 1-3 years.',
        'image': '/healthyeating.jpg',
        'file_url': 'https://babyfriendlynl.ca/wp-content/uploads/2018/06/Healthy-Eating-for-Your-Toddler-2014-with-vit.-D-update-Feb.-2017.pdf'
    },
    {
        'title': 'Emotional Development Stages',
        'category': 'Psychology',
        'resource_type': 'DOC',
        'description': "Understanding your child's emotional growth and how to support it effectively.",
        'image': '/social-emotional.jpg',
        'file_url': 'https://www.rasmussen.edu/degrees/education/blog/stages-of-emotional-development/'
    },
    {
        'title': 'Managing Tantrums Effectively',
        'category': 'Behavior',
        'resource_type': 'PDF',
        'description': 'Practical strategies for handling challenging behaviors in young children.',
        'image': '/traumakid.jpg',
        'file_url': 'https://snhr.org/wp-content/uploads/2023/05/TPYK-Handbook-EN06122022.pdf'
    },
    {
        'title': 'Healthy Sleep Habits',
        'category': 'Sleep',
        'resource_type': 'DOC',
        'description': 'Creating bedtime routines and ensuring quality sleep for optimal development.',
        'image': '/healthySleep.jpg',
        'file_url': 'https://www.nationwidechildrens.org/conditions/health-library/healthy-sleep-habits-in-children'
    },
    {
        'title': 'Language Development Milestones',
        'category': 'Language',
        'resource_type': 'DOC',
        'description': "Supporting your child's communication skills from birth to age 6.",
        'image': '/languageDev.png',
        'file_url': 'https://socialsci.libretexts.org/Bookshelves/Human_Development/Lifespan_Development_(OpenStax)/03%3A_Physical_and_Cognitive_Development_in_Infants_and_Toddlers_(Birth_to_Age_3)/3.05%3A_Language_in_Infants_and_Toddlers'
    },
    {
        'title': 'Child Safety Essentials',
        'category': 'Safety',
        'resource_type': 'DOC',
        'description': 'Comprehensive guide to keeping your child safe at home and outdoors.',
        'image': '/safety.jpg',
        'file_url': 'https://www.savethechildren.net/stories/tips-keeping-children-under-12-safe-online'
    }
]

# Add resources to database
print("\nAdding resources to database...")
for resource in resources:
    elibrary = ELibrary.objects.create(**resource)
    print(f"✓ Added: {elibrary.title} ({elibrary.category})")

print(f"\n✨ Successfully added {len(resources)} resources to the database!")
print("You can now view them at: http://localhost:8000/admin/ecd_app/elibrary/")
