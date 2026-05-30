import os
from datetime import date

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from ecd_app.models import Activity, ELibrary, Milestone  # noqa: E402

CATEGORY_ACTIVITY_DOMAIN = {
    'social-emotional': 'Social-Emotional',
    'cognitive': 'Cognitive',
    'physical': 'Physical',
    'language': 'Language',
    'self-care': 'Fine Motor',
    'executive-function': 'Science',
}

CATEGORY_LIBRARY_CATEGORY = {
    'social-emotional': 'Behavior',
    'cognitive': 'Psychology',
    'physical': 'Safety',
    'language': 'Language',
    'self-care': 'Nutrition',
    'executive-function': 'Psychology',
}

SUPPORT_GUIDE_LINKS = {
    'social-emotional': 'https://www.virtuallabschool.org/infant-toddler/social-and-emotional-development/lesson-2',
    'cognitive': 'https://www.cdc.gov/act-early/milestones/index.html',
    'physical': 'https://www.healthychildren.org/English/family-life/health-management/Pages/Milestones-Matter.aspx',
    'language': 'https://www.asha.org/public/developmental-milestones/communication-milestones/',
    'self-care': 'https://www.zerotothree.org/resource/supporting-early-development-one-milestone-at-a-time/',
    'executive-function': 'https://developingchild.harvard.edu/resource-guides/guide-executive-function/',
}

CATEGORY_LABEL = {
    'social-emotional': 'Social-Emotional',
    'cognitive': 'Cognitive',
    'physical': 'Physical',
    'language': 'Language',
    'self-care': 'Self-Care',
    'executive-function': 'Executive Function',
}

CATEGORY_IMAGE = {
    'social-emotional': '/social-emotional.jpg',
    'cognitive': '/traumakid.jpg',
    'physical': '/safety.jpg',
    'language': '/languageDev.png',
    'self-care': '/healthyeating.jpg',
    'executive-function': '/healthySleep.jpg',
}

MILESTONE_ACTIVITY_TEMPLATES = {
    'Hand-Eye Coordination': {
        'title': 'Catch and Drop Basket Game',
        'description': (
            'Place a basket close to the child. Let the child pick soft balls or blocks and drop them into the basket. '
            'Start with short distance and move slightly farther as confidence improves. '
            'Say simple cues like "look, reach, hold, drop" while playing.'
        ),
        'duration': '15 min',
        'domain': 'Physical',
    },
    'Responds to Social Cues': {
        'title': 'Face and Feeling Match',
        'description': (
            'Show simple face expressions (happy, sad, surprised) and ask the child to copy. '
            'Use short prompts like "show me happy" or "who is sad?". '
            'Praise every correct response to build confidence in reading social signals.'
        ),
        'duration': '15 min',
        'domain': 'Social-Emotional',
    },
    'Combines Words or Gestures': {
        'title': 'Say and Show Routine',
        'description': (
            'Ask the child to combine a word with an action, such as "more" + pointing, "bye" + waving, or "open" + hand motion. '
            'Model once and let the child repeat in real daily situations. '
            'Keep language short and clear to support expression.'
        ),
        'duration': '15 min',
        'domain': 'Language',
    },
    'Self-Help Physical Skills': {
        'title': 'Daily Self-Care Practice',
        'description': (
            'Practice one self-help skill at a time, such as buttoning, zipping, washing hands, or using a spoon. '
            'Break the task into small steps and guide only when needed. '
            'Celebrate independent attempts to increase motivation.'
        ),
        'duration': '15 min',
        'domain': 'Physical',
    },
    'Understands Basic Language': {
        'title': 'Simple Instruction Game',
        'description': (
            'Give easy one-step instructions like "clap hands", "touch nose", or "bring the ball". '
            'Then move to two-step instructions slowly when the child succeeds. '
            'Use familiar words and repeat gently for better understanding.'
        ),
        'duration': '15 min',
        'domain': 'Language',
    },
    'Shares and Takes Turns': {
        'title': 'My Turn Your Turn Play',
        'description': (
            'Use a ball, blocks, or puzzle pieces and play by saying "my turn" and "your turn" clearly. '
            'Keep each turn short so waiting is easier for the child. '
            'Give positive praise every time the child waits or shares successfully.'
        ),
        'duration': '15 min',
        'domain': 'Social-Emotional',
    },
}

UNLINKED_ACTIVITY_TEMPLATES = {
    'Understands Basic Language': {
        'title': 'Simple Instruction Game',
        'description': (
            'Give easy one-step instructions like "clap hands", "touch nose", or "bring the ball". '
            'Then move to two-step instructions slowly when the child succeeds. '
            'Use familiar words and repeat gently for better understanding.'
        ),
        'duration': '15 min',
        'domain': 'Language',
    },
    'Interaction with Others': {
        'title': 'Friendship Play Circle',
        'description': (
            'Play a simple turn-based game with a toy or ball. '
            'Practice greeting, sharing, and waiting for a turn using short prompts. '
            'Praise calm interaction and kind words each round.'
        ),
        'duration': '15 min',
        'domain': 'Social-Emotional',
    },
}


def build_category_based_activity(milestone):
    category = (milestone.category or '').strip().lower()
    title = f'{milestone.title} Practice Play'

    if category == 'social-emotional':
        description = (
            f'Play a short social game to improve "{milestone.title}". '
            'Use simple phrases like "my turn" and "your turn". '
            'Model the behavior first, then let the child try with praise after each success.'
        )
        domain = 'Social-Emotional'
    elif category == 'language':
        description = (
            f'Use picture cards and daily objects to practice "{milestone.title}". '
            'Give one clear instruction at a time and ask the child to repeat or respond. '
            'Keep sessions playful with songs, pointing, and short story prompts.'
        )
        domain = 'Language'
    elif category == 'physical':
        description = (
            f'Do movement-based activities to improve "{milestone.title}". '
            'Use ball play, reach-and-place, and balance tasks in short rounds. '
            'Increase challenge slowly as coordination improves.'
        )
        domain = 'Physical'
    elif category == 'self-care':
        description = (
            f'Practice "{milestone.title}" using real daily routines. '
            'Break tasks into small steps, show each step once, and let the child complete it. '
            'Use visual cues and encouragement to build independence.'
        )
        domain = 'Fine Motor'
    elif category == 'executive-function':
        description = (
            f'Use short focus-and-wait games for "{milestone.title}". '
            'Give clear start/stop cues and use visual reminders. '
            'Reward calm waiting and task completion to improve self-regulation.'
        )
        domain = 'Science'
    else:
        description = (
            f'Practice "{milestone.title}" in a fun 10-15 minute routine. '
            'Model first, then let the child try independently. '
            'Repeat daily with positive feedback.'
        )
        domain = 'Cognitive'

    return {
        'title': title,
        'description': description,
        'duration': '15 min',
        'domain': domain,
    }


def infer_age_band(child):
    if child.age is not None:
        age = child.age
    elif child.date_of_birth:
        today = date.today()
        age = today.year - child.date_of_birth.year - (
            (today.month, today.day) < (child.date_of_birth.month, child.date_of_birth.day)
        )
    else:
        age = 4

    if age <= 3:
        return 'Age 2-3'
    if age == 4:
        return 'Age 3-4'
    if age == 5:
        return 'Age 4-5'
    return 'Age 5-6'


def ensure_library_per_milestone_category():
    created = 0
    updated = 0
    milestone_categories = set(Milestone.objects.values_list('category', flat=True))

    for category in milestone_categories:
        resource_category = CATEGORY_LIBRARY_CATEGORY.get(category, 'Psychology')
        category_label = CATEGORY_LABEL.get(category, category.replace('-', ' ').title())
        image_path = CATEGORY_IMAGE.get(category, '/happychild.jpg')
        title = f'{category_label} Milestone Support Guide'

        obj, was_created = ELibrary.objects.get_or_create(
            title=title,
            defaults={
                'resource_type': 'DOC',
                'category': resource_category,
                'description': (
                    f'Practical home and classroom strategies to improve {category_label.lower()} milestones, '
                    'with clear routines, reinforcement tips, and progress-check ideas.'
                ),
                'file_url': SUPPORT_GUIDE_LINKS.get(category, 'https://www.cdc.gov/child-development/about/developmental-milestones.html'),
                'image': image_path,
            },
        )

        if was_created:
            created += 1
            print(f'Created library: {obj.title} ({obj.category})')
        else:
            changed = False
            if obj.image != image_path:
                obj.image = image_path
                changed = True
            if obj.category != resource_category:
                obj.category = resource_category
                changed = True
            target_file_url = SUPPORT_GUIDE_LINKS.get(category, 'https://www.cdc.gov/child-development/about/developmental-milestones.html')
            if obj.file_url != target_file_url:
                obj.file_url = target_file_url
                changed = True
            if changed:
                obj.save(update_fields=['image', 'category', 'file_url'])
                updated += 1
                print(f'Updated library image/category: {obj.title} ({obj.category})')

    return created, updated


def ensure_activity_per_milestone():
    created = 0
    updated = 0

    milestones = Milestone.objects.select_related('child').all()
    for milestone in milestones:
        template = MILESTONE_ACTIVITY_TEMPLATES.get(milestone.title)
        generated = build_category_based_activity(milestone)
        default_domain = CATEGORY_ACTIVITY_DOMAIN.get(milestone.category, 'Cognitive')

        target_title = template['title'] if template else generated['title']
        target_description = (
            template['description']
            if template
            else generated['description']
        )
        target_duration = template['duration'] if template else generated['duration']
        target_domain = template['domain'] if template else (generated['domain'] or default_domain)

        milestone_activity = milestone.activities.order_by('-id').first()
        if milestone_activity is None:
            activity = Activity.objects.create(
                title=target_title,
                description=target_description,
                age=infer_age_band(milestone.child),
                duration=target_duration,
                domain=target_domain,
                milestone=milestone,
            )
            created += 1
            print(f'Created activity: {activity.title} (milestone_id={milestone.id}, domain={target_domain})')
            continue

        changed_fields = []
        is_generic_existing = (
            (milestone_activity.title or '').endswith(' - Guided Practice')
            or 'Focused guided practice plan for' in (milestone_activity.description or '')
        )

        if (template or is_generic_existing) and milestone_activity.title != target_title:
            milestone_activity.title = target_title
            changed_fields.append('title')
        if (template or is_generic_existing) and milestone_activity.description != target_description:
            milestone_activity.description = target_description
            changed_fields.append('description')
        if (template or is_generic_existing) and milestone_activity.duration != target_duration:
            milestone_activity.duration = target_duration
            changed_fields.append('duration')
        if (template or is_generic_existing) and milestone_activity.domain != target_domain:
            milestone_activity.domain = target_domain
            changed_fields.append('domain')

        if changed_fields:
            milestone_activity.save(update_fields=changed_fields)
            updated += 1
            print(
                f'Updated activity for milestone_id={milestone.id}: '
                f'{milestone_activity.title} ({", ".join(changed_fields)})'
            )

    return created, updated


def ensure_unlinked_generic_activities():
    updated = 0
    generic_qs = Activity.objects.filter(milestone__isnull=True)

    for activity in generic_qs:
        current_description = (activity.description or '')
        is_generic = (
            (activity.title or '').endswith(' - Guided Practice')
            or 'Focused guided practice plan for' in current_description
        )
        if not is_generic:
            continue

        base_title = (activity.title or '').replace(' - Guided Practice', '').strip()
        template = UNLINKED_ACTIVITY_TEMPLATES.get(base_title)
        if template:
            new_title = template['title']
            new_description = template['description']
            new_duration = template['duration']
            new_domain = template['domain']
        else:
            new_title = f'{base_title} Practice Play' if base_title else 'Guided Practice Play'
            new_description = (
                f'Practice "{base_title}" using short, playful activities with clear one-step instructions. '
                'Model first, then let the child try and celebrate progress.'
                if base_title
                else 'Use short playful steps, model once, and encourage independent attempts.'
            )
            new_duration = activity.duration or '15 min'
            new_domain = activity.domain or 'Cognitive'

        changed_fields = []
        if activity.title != new_title:
            activity.title = new_title
            changed_fields.append('title')
        if activity.description != new_description:
            activity.description = new_description
            changed_fields.append('description')
        if activity.duration != new_duration:
            activity.duration = new_duration
            changed_fields.append('duration')
        if activity.domain != new_domain:
            activity.domain = new_domain
            changed_fields.append('domain')

        if changed_fields:
            activity.save(update_fields=changed_fields)
            updated += 1
            print(f'Updated unlinked activity id={activity.id}: {activity.title}')

    return updated


if __name__ == '__main__':
    print('Seeding milestone recommendation coverage...')
    lib_created, lib_updated = ensure_library_per_milestone_category()
    act_created, act_updated = ensure_activity_per_milestone()
    unlinked_updated = ensure_unlinked_generic_activities()
    print(
        f'Completed. Library created: {lib_created}, Library updated: {lib_updated}, '
        f'Activities created: {act_created}, Activities updated: {act_updated}, '
        f'Unlinked activities updated: {unlinked_updated}'
    )
