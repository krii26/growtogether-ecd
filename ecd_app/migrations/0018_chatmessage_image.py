from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecd_app', '0017_alter_chatmessage_document'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatmessage',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='chat_images/'),
        ),
    ]
