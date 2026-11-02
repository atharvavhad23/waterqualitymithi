#!/usr/bin/env python
"""
Quick script to ensure atharva78 can login with password: 23112005
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Get or create user
username = 'atharva78'
password = '23112005'

try:
    user = User.objects.get(username=username)
    print(f"✅ User '{username}' found")
except User.DoesNotExist:
    print(f"❌ User '{username}' not found!")
    exit(1)

# Set the password
user.set_password(password)
user.is_active = True
user.save()
print(f"✅ Password set to: {password}")
print(f"✅ User is active: {user.is_active}")

# Get or create token
token, created = Token.objects.get_or_create(user=user)
print(f"✅ Token: {token.key}")

# Test authentication
from django.contrib.auth import authenticate
test_user = authenticate(username=username, password=password)
if test_user:
    print(f"\n🎉 SUCCESS! Login credentials work:")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
    print(f"   Token: {token.key}")
else:
    print(f"\n❌ FAILED! Authentication did not work")
