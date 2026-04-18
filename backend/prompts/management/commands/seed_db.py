from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from prompts.models import Prompt, Tag

class Command(BaseCommand):
    help = 'Seeds the database with initial dummy data if tables are empty'

    def handle(self, *args, **kwargs):
        # 1. Check if data already exists
        if User.objects.exists() or Prompt.objects.exists():
            self.stdout.write(self.style.WARNING('Database already contains data. Skipping seeding.'))
            return

        self.stdout.write(self.style.NOTICE('Database is empty. Starting seeding process...'))

        # 2. Create Admin User
        User.objects.create_superuser('admin', 'admin@example.com', 'password123')
        self.stdout.write(self.style.SUCCESS('Created test user: admin / password123'))

        # 3. Create Tags
        tags = ['anime', 'cyberpunk', 'realistic', 'fantasy', '3d']
        tag_objects = {}
        for t in tags:
            obj, _ = Tag.objects.get_or_create(name=t)
            tag_objects[t] = obj

        # 4. Create Prompts
        prompts_data = [
            {
                "title": "Neon City Streets",
                "content": "A bustling cyberpunk city at night, neon lights reflecting in puddles, cinematic lighting, 8k resolution.",
                "complexity": 8,
                "tags": ['cyberpunk', 'realistic']
            },
            {
                "title": "Studio Ghibli Forest",
                "content": "A lush, green, magical forest with floating spirits, in the art style of Studio Ghibli, vibrant colors.",
                "complexity": 4,
                "tags": ['anime', 'fantasy']
            }
        ]

        for data in prompts_data:
            prompt = Prompt.objects.create(
                title=data['title'],
                content=data['content'],
                complexity=data['complexity']
            )
            for tag_name in data['tags']:
                prompt.tags.add(tag_objects[tag_name])
            self.stdout.write(self.style.SUCCESS(f'Created prompt: {prompt.title}'))

        self.stdout.write(self.style.SUCCESS('Database seeding complete!'))