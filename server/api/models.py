from django.db import models


class River(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    quality_index = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Model for user_register table
class UserRegister(models.Model):
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    reset_otp = models.CharField(max_length=10, blank=True, null=True)
    reset_otp_expiry = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.email
