from django.db import migrations, models


TEACHER_CATEGORY_BY_EMAIL = {
    'socioemo@gmail.com': 'social_emotional',
    'cognitive@gmail.com': 'cognitive',
    'physical@gmail.com': 'physical',
    'language@gmail.com': 'language',
    'selfcare@gmail.com': 'self_care_independence',
    'executive@gmail.com': 'executive_function_attention',
}

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


def normalize_category(value):
    if not value:
        return ''
    key = str(value).strip().lower()
    return CATEGORY_NORMALIZATION.get(key, '')


def extract_category_from_notes(notes):
    text = str(notes or '')
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line.lower().startswith('category:'):
            return normalize_category(line.split(':', 1)[1].strip())
    return ''


def forward_fill_categories(apps, schema_editor):
    UserProfile = apps.get_model('ecd_app', 'UserProfile')
    ProgressReport = apps.get_model('ecd_app', 'ProgressReport')

    # Assign specialization categories to existing teacher accounts.
    for profile in UserProfile.objects.select_related('user').filter(role='TEACHER'):
        email = (getattr(profile.user, 'email', '') or '').strip().lower()
        category = TEACHER_CATEGORY_BY_EMAIL.get(email, '')
        if category and profile.category != category:
            profile.category = category
            profile.save(update_fields=['category'])

    # Backfill progress report category from existing notes where possible.
    for report in ProgressReport.objects.all():
        normalized = normalize_category(getattr(report, 'category', ''))
        if not normalized:
            normalized = extract_category_from_notes(getattr(report, 'notes', ''))
        if normalized and report.category != normalized:
            report.category = normalized
            report.save(update_fields=['category'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('ecd_app', '0019_child_parent'),
    ]

    operations = [
        migrations.AddField(
            model_name='progressreport',
            name='category',
            field=models.CharField(blank=True, choices=[('social_emotional', 'Social-Emotional'), ('cognitive', 'Cognitive'), ('physical', 'Physical'), ('language', 'Language'), ('self_care_independence', 'Self-Care & Independence'), ('executive_function_attention', 'Executive Function & Attention')], db_index=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='category',
            field=models.CharField(blank=True, choices=[('social_emotional', 'Social-Emotional'), ('cognitive', 'Cognitive'), ('physical', 'Physical'), ('language', 'Language'), ('self_care_independence', 'Self-Care & Independence'), ('executive_function_attention', 'Executive Function & Attention')], default='', max_length=50),
        ),
        migrations.RunPython(forward_fill_categories, noop_reverse),
    ]
