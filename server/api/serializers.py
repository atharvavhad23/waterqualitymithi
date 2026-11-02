from rest_framework import serializers
from .models import River

class RiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = River
        fields = '__all__'
