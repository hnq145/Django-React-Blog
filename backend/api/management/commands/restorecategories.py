from django.core.management.base import BaseCommand
from api.models import Category

class Command(BaseCommand):
    help = 'Restores the initial set of categories'

    def handle(self, *args, **options):
        initial_categories = [
            'World', 'Technology', 'Design', 'Culture', 'Business',
            'Politics', 'Opinion', 'Science', 'Health', 'Style', 'Travel'
        ]

        self.stdout.write('Restoring categories...')
        for category_name in initial_categories:
            category, created = Category.objects.get_or_create(name=category_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created category "{category_name}"'))
            else:
                self.stdout.write(f'Category "{category_name}" already exists.')
        self.stdout.write('Finished restoring categories.')
