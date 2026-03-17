from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import SellerApplication
from .serializers import SellerApplicationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class SubmitApplicationView(generics.CreateAPIView):
    serializer_class = SellerApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # prevent Admin users from applying as sellers
        try:
            role = getattr(request.user, 'role', None)
        except Exception:
            role = None
        if role == 'Admin':
            return Response({'detail': 'Admins cannot apply to be sellers.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ListApplicationView(generics.ListAPIView):
    # only show pending applications in admin list
    queryset = SellerApplication.objects.filter(status='pending').order_by('-created_at')
    serializer_class = SellerApplicationSerializer
    permission_classes = [permissions.IsAdminUser]


class ApproveApplicationView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        app = get_object_or_404(SellerApplication, pk=pk)
        merchant_id = request.data.get('merchant_id')
        if not merchant_id:
            return Response({'detail': 'merchant_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        # Prevent approving if already a seller
        if app.user.role == 'Seller':
            return Response({'detail': 'User is already a seller'}, status=status.HTTP_400_BAD_REQUEST)

        app.status = 'approved'
        app.user.role = 'Seller'
        app.user.merchant_id = merchant_id
        app.user.save()
        # remove the application record now that it's resolved
        app.delete()
        return Response({'detail': 'approved'})


class DeclineApplicationView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        app = get_object_or_404(SellerApplication, pk=pk)
        reason = request.data.get('reason', '')
        # mark declined then remove the application record
        app.status = 'declined'
        app.decline_reason = reason
        app.save()
        app.delete()
        return Response({'detail': 'declined'})
