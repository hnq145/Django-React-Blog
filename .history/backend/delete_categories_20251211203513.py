
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Category

def delete_categories():
    categories_to_delete = ['Sport', 'Entertainment', 'Lifestyle', 'Culture']
    
    for category_name in categories_to_delete:
        try:
            category = Category.objects.get(title=category_name)
            category.delete()
            print(f"Category '{category_name}' deleted successfully.")
        except Category.DoesNotExist:
            print(f"Category '{category_name}' does not exist.")

if __name__ == '__main__':
    delete_categories()
