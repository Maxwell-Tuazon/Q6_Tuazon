from django.urls import path, include
from . import views
from rest_framework import routers

urlpatterns = [
    # Keep only the public root routes here. Authentication and user
    # management are served under `/api/v1/users/` from the `users` app.
    path('', views.getRoutes, name='get-routes'),
]