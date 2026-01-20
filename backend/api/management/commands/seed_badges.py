from api.models import Badge, User
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Seeds initial badges'

    def handle(self, *args, **kwargs):
        badges = [
            {
                "name": "Newbie",
                "description": "Welcome to the community!",
                "icon": "fas fa-baby"
            },
            {
                "name": "Writer",
                "description": "Posted your first article.",
                "icon": "fas fa-pen-nib"
            },
            {
                "name": "Commenter",
                "description": "Joined the conversation.",
                "icon": "fas fa-comments"
            },
            {
                "name": "Pro User",
                "description": "Highly active member.",
                "icon": "fas fa-crown"
            }
        ]

        for b in badges:
            badge, created = Badge.objects.get_or_create(name=b['name'], defaults=b)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created badge: {b['name']}"))
            else:
                self.stdout.write(f"Badge already exists: {b['name']}")
        
        # Assign 'Newbie' badge to all current users if they don't have it
        newbie_badge = Badge.objects.get(name="Newbie")
        for user in User.objects.all():
            if hasattr(user, 'profile'):
                if newbie_badge not in user.profile.badges.all():
                    user.profile.badges.add(newbie_badge)
                    self.stdout.write(f"Assigned Newbie badge to {user.username}")

        self.stdout.write(self.style.SUCCESS('Successfully seeded badges'))
