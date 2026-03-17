from django.shortcuts import render
from django.http import JsonResponse, Http404

from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from .models import *
static_products = []

from rest_framework import serializers


# Create your views here.
@api_view(['GET'])
def getRoutes(request):
    # Advertise the current public API surfaces. Product endpoints moved to /api/v1/services/.
    routes = [
        '/api/v1/services/',
        '/api/v1/services/<id>/',
        '/api/v1/users/login/',
        '/api/v1/users/register/',
    ]
    return JsonResponse(routes, safe=False)


@api_view(['GET'])
def getProduct(request, pk):
    # Legacy endpoint removed — use /api/v1/services/<id>/ from services app.
    return Response({'detail': 'Endpoint moved. Use /api/v1/services/<id>/'}, status=410)
    
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import viewsets, permissions
from rest_framework.response import Response as DRFResponse
from rest_framework.decorators import action
import traceback

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        # include SerializerMethodField names here ('name', '_id', 'isAdmin')
        fields = ['id', 'username', 'email', 'isAdmin', 'name', '_id']
    def get__id(self, obj):
        return obj.id
    def get_isAdmin(self, obj):
        return obj.is_staff
    def get_name(self, obj):
        name = obj.first_name
        if name == '':
            # fallback to email, then username when no first name provided
            name = obj.email if obj.email else obj.username
        return name

@api_view(['GET'])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


@api_view(['POST'])
def registerUser(request):
    data = request.data

    try:
        # Accept username (preferred) and optional email. Email is not required.
        # Also allow using `name` as the username when `username` is not provided.
        username = data.get('username') or data.get('email') or data.get('name')
        if not username:
            return Response({'detail': 'username (or name) is required'}, status=400)

        user = User.objects.create_user(
            username=username,
            email=data.get('email',''),
            password=data['password'],
            first_name=data.get('name','')
        )
        user.save()

        refresh = RefreshToken.for_user(user)

        serializer = UserSerializer(user, many=False).data

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            **serializer
        })

    except Exception as e:
        return Response({'detail': str(e)}, status=400)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        serializer = UserSerializer(self.user).data

        for k, v in serializer.items():
            data[k] = v

        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# DRF ViewSets for API
# Product endpoints have been removed in favor of the `services` app.
# If you need to migrate existing product data into services, run the
# management command `python manage.py migrate_products_to_services`.


class UserViewSet(viewsets.ViewSet):
    # list: admin only, retrieve: authenticated, create: open
    def list(self, request):
        if not request.user.is_staff:
            return DRFResponse({'detail': 'Not authorized'}, status=403)
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return DRFResponse(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return DRFResponse({'detail': 'Not found'}, status=404)
        # allow user to fetch own profile or admins
        if request.user.is_authenticated and (request.user.id == user.id or request.user.is_staff):
            serializer = UserSerializer(user, many=False)
            return DRFResponse(serializer.data)
        return DRFResponse({'detail': 'Not authorized'}, status=403)

    def create(self, request):
        data = request.data
        username = data.get('username') or data.get('email') or data.get('name')
        if not username:
            return DRFResponse({'detail': 'username (or name) is required'}, status=400)
        password = data.get('password')
        if not password:
            return DRFResponse({'detail': 'password is required'}, status=400)
        try:
            user = User.objects.create_user(
                username=username,
                email=data.get('email',''),
                password=password,
                first_name=data.get('name','')
            )
            user.save()
            serializer = UserSerializer(user, many=False).data
            refresh = RefreshToken.for_user(user)
            return DRFResponse({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                **serializer
            })
        except Exception as e:
            return DRFResponse({'detail': str(e)}, status=400)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user, many=False)
        return DRFResponse(serializer.data)
