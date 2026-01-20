from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Creates an admin user with username "admin" and password "admin123"'

    def handle(self, *args, **options):
        username = 'admin'
        password = 'admin123'
        email = 'admin@jobportal.com'

        # Check if admin user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists. Updating...')
            )
            user = User.objects.get(username=username)
            user.set_password(password)
            user.role = 'admin'
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.email = email
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated admin user "{username}"')
            )
        else:
            # Create new admin user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='admin',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created admin user "{username}"')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nAdmin credentials:\nUsername: {username}\nPassword: {password}')
        )
