from django.db import migrations


TEACHER_CATEGORY_BY_EMAIL = {
    'socioemo@gmail.com': 'social_emotional',
    'socio@gmail.com': 'social_emotional',
    'cognitive@gmail.com': 'cognitive',
    'congitive@gmail.com': 'cognitive',
    'physical@gmail.com': 'physical',
    'language@gmail.com': 'language',
    'selfcare@gmail.com': 'self_care_independence',
    'executive@gmail.com': 'executive_function_attention',
}


def forward_fill_teacher_category_aliases(apps, schema_editor):
    UserProfile = apps.get_model('ecd_app', 'UserProfile')

    for profile in UserProfile.objects.select_related('user').filter(role='TEACHER'):
        email = (getattr(profile.user, 'email', '') or '').strip().lower()
        category = TEACHER_CATEGORY_BY_EMAIL.get(email, '')
        if category and profile.category != category:
            profile.category = category
            profile.save(update_fields=['category'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('ecd_app', '0020_teacher_specialization'),
    ]

    operations = [
        migrations.RunPython(forward_fill_teacher_category_aliases, noop_reverse),
    ]
