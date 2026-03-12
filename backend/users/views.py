from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response




from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import User
from django.contrib.auth.hashers import make_password

from django.contrib.auth.hashers import check_password

@api_view(['POST'])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"})

    User.objects.create_user(username=username, password=password)
    return Response({"message": "User registered successfully"})


@api_view(['POST'])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user:
        return Response({"message": "Login successful", "user_id": user.id})
    else:
        return Response({"error": "Invalid credentials"})



# @api_view(["POST"])
# def register(request):
#     email = request.data.get("email")
#     password = request.data.get("password")
#     full_name = request.data.get("full_name")
#     phone = request.data.get("phone")

#     # check if email already exists
#     if User.objects.filter(email=email).exists():
#         return Response({"message": "Email already registered"}, status=400)

#     # create user
#     user = User.objects.create(
#         email=email,
#         full_name=full_name,
#         phone=phone,
#         password=make_password(password),
#     )

#     return Response({"message": "Registration successful"})





from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password


@api_view(["POST"])
def register(request):

    email = request.data.get("email")
    password = request.data.get("password")
    full_name = request.data.get("full_name")
    phone = request.data.get("phone")

    # validation
    if not email or not password or not full_name:
        return Response({"message": "All fields are required"}, status=400)

    # check existing email
    if User.objects.filter(email=email).exists():
        return Response({"message": "Email already registered"}, status=400)

    # create user
    user = User.objects.create(
        username=email,
        email=email,
        first_name=full_name,
        password=make_password(password)
    )

    return Response({
        "message": "Registration successful",
        "user": {
            "name": user.first_name,
            "email": user.email
        }
    })

@csrf_exempt
def login_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        email = data.get("email")
        password = data.get("password")

        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                return JsonResponse({
                    "message": "Login successful",
                    "user_id": user.id
                })
            else:
                return JsonResponse({"message": "Invalid password"}, status=400)

        except User.DoesNotExist:
            return JsonResponse({"message": "User not found"}, status=404)