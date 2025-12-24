import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Category

def show_categories():
    print("Listing all categories in the database:")
    categories = Category.objects.all()
    if categories:
        for category in categories:
            print(f"- ID: {category.id}, Title: {category.title}, Slug: {category.slug}, Image: {category.image}")
    else:
        print("No categories found in the database.")

if __name__ == "__main__":
    show_categories()
