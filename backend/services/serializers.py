from rest_framework import serializers
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    seller_email = serializers.CharField(source='seller.email', read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'seller', 'seller_email', 'service_name', 'description', 'price', 'duration_of_service', 'sample_image']
        read_only_fields = ['seller', 'seller_email']
