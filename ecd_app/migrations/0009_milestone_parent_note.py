from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecd_app', '0008_alter_activity_options_remove_activity_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='milestone',
            name='parent_note',
            field=models.TextField(blank=True),
        ),
    ]