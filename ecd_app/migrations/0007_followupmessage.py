from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ecd_app', '0006_elibrary_image_file_alter_elibrary_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='FollowUpMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('parent_name', models.CharField(max_length=100)),
                ('message', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('child', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='follow_up_messages', to='ecd_app.child')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
