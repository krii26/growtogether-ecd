from django.db import migrations, models
import django.db.models.deletion


def seed_default_milestone_categories(apps, schema_editor):
    MilestoneCategory = apps.get_model('ecd_app', 'MilestoneCategory')
    defaults = [
        ('social-emotional', 'social-emotional'),
        ('cognitive', 'cognitive'),
        ('physical', 'physical'),
        ('language', 'language'),
        ('self-care', 'self-care'),
        ('executive-function', 'executive-function'),
    ]
    for name, slug in defaults:
        MilestoneCategory.objects.get_or_create(name=name, defaults={'slug': slug})


class Migration(migrations.Migration):

    dependencies = [
        ('ecd_app', '0021_backfill_teacher_category_aliases'),
    ]

    operations = [
        migrations.CreateModel(
            name='MilestoneCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80, unique=True)),
                ('slug', models.SlugField(blank=True, max_length=100, unique=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='MilestoneTitle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=120)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='titles', to='ecd_app.milestonecategory')),
            ],
            options={
                'ordering': ['category__name', 'title'],
                'unique_together': {('category', 'title')},
            },
        ),
        migrations.RunPython(seed_default_milestone_categories, migrations.RunPython.noop),
    ]
