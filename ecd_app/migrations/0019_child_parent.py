from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def normalize(value):
    return ' '.join((value or '').split()).strip().lower()


def backfill_child_parent(apps, schema_editor):
    Child = apps.get_model('ecd_app', 'Child')
    User = apps.get_model(settings.AUTH_USER_MODEL.split('.')[0], settings.AUTH_USER_MODEL.split('.')[1])

    parent_lookup = {}
    for user in User.objects.all().iterator():
        keys = {
            normalize(user.username),
            normalize(user.email),
            normalize(f'{user.first_name} {user.last_name}'),
            normalize(user.first_name),
            normalize(user.last_name),
        }
        for key in keys:
            if key and key not in parent_lookup:
                parent_lookup[key] = user.id

    for child in Child.objects.filter(parent__isnull=True).exclude(parent_name__isnull=True).iterator():
        parent_id = parent_lookup.get(normalize(child.parent_name))
        if parent_id:
            child.parent_id = parent_id
            child.save(update_fields=['parent'])


class Migration(migrations.Migration):

    dependencies = [
        ('ecd_app', '0018_chatmessage_image'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='child',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to=settings.AUTH_USER_MODEL),
        ),
        migrations.RunPython(backfill_child_parent, migrations.RunPython.noop),
    ]