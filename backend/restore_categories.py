
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Category

def restore_categories():
    initial_categories = [
        'Health',
        'Finance',
        'Sport',
        'Entertainment',
        'Lifestyle',
        'Technology',
        'Culture'
    ]

    for category_name in initial_categories:
        category, created = Category.objects.get_or_create(title=category_name)
        if created:
            print(f'Category "{category.title}" has been restored.')
        else:
            print(f'Category "{category.title}" already exists.')

if __name__ == '__main__':
    restore_categories()
