from django.urls import path
from .views import MyTokenObtainPairView, RegisterView, UserProfileView, AdminUserListView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
]
