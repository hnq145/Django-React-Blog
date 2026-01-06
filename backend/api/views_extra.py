from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api import models as api_models

class DashboardMarkAllNotificationsAsSeen(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        api_models.Notification.objects.filter(user=request.user, seen=False).update(seen=True)
        return Response({'message': 'All notifications marked as seen'}, status=status.HTTP_200_OK)
