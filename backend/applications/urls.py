from django.urls import path
from .views import SubmitApplicationView, ListApplicationView, ApproveApplicationView, DeclineApplicationView

urlpatterns = [
    path('apply/', SubmitApplicationView.as_view(), name='apply'),
    path('list/', ListApplicationView.as_view(), name='list-applications'),
    # admin-prefixed endpoints for frontend admin UI
    path('admin/list/', ListApplicationView.as_view(), name='admin-list-applications'),
    # also accept admin/approve/<pk>/ and admin/decline/<pk>/ to match frontend requests
    path('admin/approve/<int:pk>/', ApproveApplicationView.as_view(), name='admin-approve-application-alt'),
    path('admin/decline/<int:pk>/', DeclineApplicationView.as_view(), name='admin-decline-application-alt'),
    path('<int:pk>/approve/', ApproveApplicationView.as_view(), name='approve-application'),
    path('<int:pk>/decline/', DeclineApplicationView.as_view(), name='decline-application'),
    path('admin/<int:pk>/approve/', ApproveApplicationView.as_view(), name='admin-approve-application'),
    path('admin/<int:pk>/decline/', DeclineApplicationView.as_view(), name='admin-decline-application'),
]
