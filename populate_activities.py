#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from ecd_app.models import Activity

activities_data = [
    {
        'title': 'Story Time Circle',
        'description': 'Read a short picture book and ask your child to point to familiar objects and animals.',
        'age': 'Age 2-3',
        'duration': '20 min',
        'domain': 'Language'
    },
    {
        'title': 'Shape Hunt',
        'description': 'Find circles, squares, and triangles around the house to build early recognition skills.',
        'age': 'Age 2-3',
        'duration': '15 min',
        'domain': 'Cognitive'
    },
    {
        'title': 'Ball Roll and Catch',
        'description': 'Sit facing each other and roll a soft ball back and forth to improve coordination.',
        'age': 'Age 2-3',
        'duration': '15 min',
        'domain': 'Physical'
    },
    {
        'title': 'Finger Painting Fun',
        'description': 'Create a rainbow garden with handprints and fingerprints while naming colors, counting dots, and spotting shapes.',
        'age': 'Age 2-3',
        'duration': '20 min',
        'domain': 'Creative'
    },
    {
        'title': 'Stack and Build',
        'description': 'Stack cups or blocks and encourage your child to copy simple tower patterns.',
        'age': 'Age 2-3',
        'duration': '15 min',
        'domain': 'Fine Motor'
    },
    {
        'title': 'Color Sorting Game',
        'description': 'Help your child sort objects into matching colors to strengthen attention and logic.',
        'age': 'Age 3-4',
        'duration': '15 min',
        'domain': 'Cognitive'
    },
    {
        'title': 'Playdough Creations',
        'description': 'Encourage creativity and fine motor skills by shaping animals, fruits, and letters.',
        'age': 'Age 3-4',
        'duration': '20 min',
        'domain': 'Fine Motor'
    },
    {
        'title': 'Action Song Time',
        'description': 'Sing action songs with movements like clap, jump, and spin to build motor planning.',
        'age': 'Age 3-4',
        'duration': '15 min',
        'domain': 'Physical'
    },
    {
        'title': 'Pretend Kitchen Play',
        'description': 'Role-play cooking and serving to improve social interaction and expressive language.',
        'age': 'Age 3-4',
        'duration': '25 min',
        'domain': 'Social-Emotional'
    },
    {
        'title': 'Puzzle Match',
        'description': 'Solve simple 4-8 piece puzzles to develop visual memory and problem-solving skills.',
        'age': 'Age 3-4',
        'duration': '20 min',
        'domain': 'Cognitive'
    },
    {
        'title': 'Obstacle Course',
        'description': 'Create a fun indoor obstacle path with cushions and cones for balance and coordination.',
        'age': 'Age 4-5',
        'duration': '30 min',
        'domain': 'Physical'
    },
    {
        'title': 'Music and Movement',
        'description': 'Dance and sing with rhythm patterns to improve listening and body control.',
        'age': 'Age 4-5',
        'duration': '15 min',
        'domain': 'Creative'
    },
    {
        'title': 'Rhyming Word Basket',
        'description': 'Pick picture cards and find rhyming pairs to build phonological awareness.',
        'age': 'Age 4-5',
        'duration': '20 min',
        'domain': 'Language'
    },
    {
        'title': 'Pattern Bead Stringing',
        'description': 'Create repeating color patterns with beads to support sequencing and fine motor control.',
        'age': 'Age 4-5',
        'duration': '20 min',
        'domain': 'Fine Motor'
    },
    {
        'title': 'Emotion Faces Game',
        'description': 'Use mirror play to identify happy, sad, angry, and surprised expressions.',
        'age': 'Age 4-5',
        'duration': '15 min',
        'domain': 'Social-Emotional'
    },
    {
        'title': 'Science Experiment',
        'description': 'Try simple science activities like color mixing or sink-and-float with predictions.',
        'age': 'Age 5-6',
        'duration': '25 min',
        'domain': 'Science'
    },
    {
        'title': 'Story Retell Challenge',
        'description': 'After reading a short story, ask your child to retell beginning, middle, and end.',
        'age': 'Age 5-6',
        'duration': '20 min',
        'domain': 'Language'
    },
    {
        'title': 'Number Hopscotch',
        'description': 'Play hopscotch with number calls to strengthen counting and body coordination.',
        'age': 'Age 5-6',
        'duration': '20 min',
        'domain': 'Math + Physical'
    },
    {
        'title': 'Team Cleanup Mission',
        'description': 'Turn cleanup into a timed mission to build responsibility and teamwork habits.',
        'age': 'Age 5-6',
        'duration': '15 min',
        'domain': 'Social-Emotional'
    },
    {
        'title': 'Build a Bridge',
        'description': 'Use straws or blocks to build a bridge that can hold a toy, encouraging engineering thinking.',
        'age': 'Age 5-6',
        'duration': '30 min',
        'domain': 'Cognitive'
    },
]

# Clear existing activities
Activity.objects.all().delete()

# Create activities
for activity_data in activities_data:
    Activity.objects.create(**activity_data)
    print(f"Created activity: {activity_data['title']}")

print(f"\nSuccessfully created {len(activities_data)} activities!")
