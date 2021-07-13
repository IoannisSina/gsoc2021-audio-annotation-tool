from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.reverse import reverse
from rest_framework import (
    permissions,
    status,
)


from .models import Task
from .serializers import TaskSerializer

# Create your views here.




#API VIEWS
class TaskList(APIView):

    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    serializer_class = TaskSerializer
    """
    List all tasks or create a new one
    """

    #get request
    def get(self, request, format=None):

        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)

        return Response(serializer.data)

    #post request
    def post(self, request, format=None):

        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)