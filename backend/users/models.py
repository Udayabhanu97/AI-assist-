from django.db import models

class User(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.email

class ChatHistory(models.Model):

    user = models.ForeignKey(User,on_delete=models.CASCADE)

    message = models.TextField()

    response = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)




from django.contrib.auth.models import User

class Chat(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    chat = models.ForeignKey(Chat,on_delete=models.CASCADE)
    sender = models.CharField(max_length=20)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)