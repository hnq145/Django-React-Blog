from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0007_comment_parent'),
    ]

    operations = [
        migrations.CreateModel(
            name='Badge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('icon', models.CharField(help_text='FontAwesome class or image URL', max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Reaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reaction_type', models.CharField(choices=[('Like', 'Like'), ('Love', 'Love'), ('Haha', 'Haha'), ('Wow', 'Wow'), ('Sad', 'Sad'), ('Angry', 'Angry')], default='Like', max_length=50)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='api.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Reactions',
                'unique_together': {('user', 'post')},
            },
        ),
        migrations.AddField(
            model_name='profile',
            name='badges',
            field=models.ManyToManyField(blank=True, related_name='users', to='api.Badge'),
        ),
        migrations.AlterField(
            model_name='notification',
            name='type',
            field=models.CharField(choices=[('Like', 'Like'), ('Love', 'Love'), ('Haha', 'Haha'), ('Wow', 'Wow'), ('Sad', 'Sad'), ('Angry', 'Angry'), ('Comment', 'Comment'), ('Bookmark', 'Bookmark'), ('Mention', 'Mention'), ('Badge', 'Badge')], max_length=100),
        ),
    ]
