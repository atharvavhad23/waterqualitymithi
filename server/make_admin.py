import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User

# Check atharva78 user
user = User.objects.get(username='atharva78')
print(f"Username: {user.username}")
print(f"is_staff: {user.is_staff}")
print(f"is_superuser: {user.is_superuser}")

# Make atharva78 an admin if not already
if not user.is_staff and not user.is_superuser:
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print("\n✅ Updated atharva78 to admin (is_staff=True, is_superuser=True)")
else:
    print(f"\n✅ User is already admin")

# Verify all users
print("\n--- All Users ---")
for u in User.objects.all():
    print(f"{u.username}: staff={u.is_staff}, superuser={u.is_superuser}")
