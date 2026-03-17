from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
# Legacy product endpoints replaced by the `services` app. Keep user viewset here.
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('users/login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/register/', views.registerUser, name='user-register'),
    path('', views.getRoutes, name='get-routes'),
    path('users/profile/', views.getUserProfile, name='user-profile'),
    path('', include(router.urls)),
]