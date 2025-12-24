from django.core.management.base import BaseCommand
from api.models import Category

class Command(BaseCommand):
    help = 'Restores the initial categories'

    def handle(self, *args, **options):
        initial_categories = [
            'World',
            'Technology',
            'Design',
            'Culture',
            'Business',
            'Politics',
            'Opinion',
            'Science',
            'Health',
            'Style',
            'Travel'
        ]

        for category_name in initial_categories:
            category, created = Category.objects.get_or_create(name=category_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Category "{category.name}" has been restored.'))
            else:
                self.stdout.write(f'Category "{category.name}" already exists.')
