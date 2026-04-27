from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ecd_app', '0009_milestone_parent_note'),
    ]

    operations = [
        migrations.AddField(
            model_name='followupmessage',
            name='milestone',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='follow_up_messages', to='ecd_app.milestone'),
        ),
    ]
