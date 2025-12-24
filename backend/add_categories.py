
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Category

def add_categories():
    categories_to_add = [
        'World', 'Technology', 'Design', 'Culture', 'Business',
        'Politics', 'Opinion', 'Science', 'Health', 'Style', 'Travel', 'Finance'
    ]
    
    for category_name in categories_to_add:
        try:
            category, created = Category.objects.get_or_create(title=category_name)
            if created:
                print(f"Category '{category_name}' created successfully.")
            else:
                print(f"Category '{category_name}' already exists.")
        except Exception as e:
            print(f"Error creating category '{category_name}': {e}")

if __name__ == '__main__':
    add_categories()
