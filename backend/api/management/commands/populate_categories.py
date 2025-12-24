
from django.core.management.base import BaseCommand
from api.models import Category

class Command(BaseCommand):
    help = 'Populates the database with initial categories.'

    def handle(self, *args, **kwargs):
        categories_to_add = [
            'World', 'Technology', 'Design', 'Culture', 'Business',
            'Politics', 'Opinion', 'Science', 'Health', 'Style', 'Travel', 'Finance'
        ]
        
        for category_name in categories_to_add:
            try:
                category, created = Category.objects.get_or_create(title=category_name)
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Category '{category_name}' created successfully."))
                else:
                    self.stdout.write(self.style.WARNING(f"Category '{category_name}' already exists."))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error creating category '{category_name}': {e}"))
