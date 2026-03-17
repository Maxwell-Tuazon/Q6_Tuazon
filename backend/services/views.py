from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .models import Service
from .serializers import ServiceSerializer


class ServiceListView(generics.ListAPIView):
    """
    Return DB services plus static demo services from `base.services.services`.
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        # DB entries
        qs = Service.objects.all().order_by('-id')
        serializer = self.get_serializer(qs, many=True)
        db_services = list(serializer.data)

        # static extras from base.services
        try:
            from base import services as base_services_module
            extras = getattr(base_services_module, 'services', []) or []
        except Exception:
            extras = []

        combined = db_services + extras
        return Response(combined)


class ServiceDetailView(generics.RetrieveAPIView):
    """
    Retrieve a service by numeric PK from DB, otherwise look for a static entry
    in `base.services` matching `_id` or `id`.
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, pk=None, *args, **kwargs):
        # try DB lookup first for numeric ids
        if str(pk).isdigit():
            try:
                obj = Service.objects.get(pk=pk)
                serializer = self.get_serializer(obj, many=False)
                return Response(serializer.data)
            except Service.DoesNotExist:
                pass

        # fallback to static entries
        try:
            from base import services as base_services_module
            extras = getattr(base_services_module, 'services', []) or []
            for item in extras:
                if str(item.get('_id') or item.get('id')) == str(pk):
                    return Response(item)
        except Exception:
            pass

        return Response({'detail': 'Not found.'}, status=404)


class SellerServiceManageView(APIView):
    """Manage services for the logged-in seller: list and create (supports file upload)."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, format=None):
        qs = Service.objects.filter(seller=request.user).order_by('-id')
        serializer = ServiceSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = ServiceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(seller=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class SellerServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(seller=self.request.user)
