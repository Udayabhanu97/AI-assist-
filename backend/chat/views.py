import os
import requests
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import ChatHistory
from docx import Document
from PyPDF2 import PdfReader
from groq import Groq


# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ---------------- FILE READ FUNCTIONS ---------------- #

def read_txt(file):
    return file.read().decode("utf-8", errors="ignore")


def read_pdf(file):
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def read_docx(file):
    doc = Document(file)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text


# ---------------- IMAGE SEARCH ---------------- #

def get_images(query):
    url = "https://api.pexels.com/v1/search"
    headers = {
        "Authorization": os.getenv("PEXELS_API_KEY")
    }
    params = {
        "query": query,
        "per_page": 3
    }

    try:
        res = requests.get(url, headers=headers, params=params)
        data = res.json()
        return [photo["src"]["medium"] for photo in data.get("photos", [])]
    except:
        return []


# ---------------- VIDEO SEARCH ---------------- #

def get_videos(query):
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "key": os.getenv("YOUTUBE_API_KEY"),
        "type": "video",
        "maxResults": 3
    }

    try:
        res = requests.get(url, params=params)
        data = res.json()
        videos = []
        for item in data.get("items", []):
            video_id = item["id"]["videoId"]
            videos.append(f"https://www.youtube.com/watch?v={video_id}")
        return videos
    except:
        return []


# ---------------- CHAT API ---------------- #

@api_view(['POST'])
def chat_view(request):
    user_message = request.data.get("message", "")
    user_id = request.data.get("user_id")
    uploaded_file = request.FILES.get("file")

    # ✅ Validate user_id
    if user_id in [None, "", "undefined", "null"]:
        user_id = None
    else:
        try:
            user_id = int(user_id)
        except:
            user_id = None

    file_text = ""

    # Handle file upload
    if uploaded_file:
        filename = uploaded_file.name.lower()
        try:
            if filename.endswith(".txt"):
                file_text = read_txt(uploaded_file)
            elif filename.endswith(".pdf"):
                file_text = read_pdf(uploaded_file)
            elif filename.endswith(".docx"):
                file_text = read_docx(uploaded_file)
            elif filename.endswith((".jpg", ".jpeg", ".png")):
                file_text = "User uploaded an image. Describe it."
        except Exception as e:
            file_text = f"Error reading file: {str(e)}"

    # Combine prompt
    prompt = user_message
    if file_text:
        prompt += "\n\nFile content:\n" + file_text[:2000]

    try:
        messages = []

        # 🔥 Load previous chat history
        if user_id:
            previous_chats = ChatHistory.objects.filter(
                user_id=user_id
            ).order_by("created_at")

            for chat in previous_chats:
                messages.append({"role": "user", "content": chat.message})
                messages.append({"role": "assistant", "content": chat.reply})

        # Add current message
        messages.append({"role": "user", "content": prompt})

        # Call AI
        ai_response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )

        reply = ai_response.choices[0].message.content

    except Exception as e:
        reply = str(e)

    # ✅ Save chat to DB safely
    if user_id:
        try:
            user = User.objects.get(id=user_id)
            ChatHistory.objects.create(
                user=user,
                message=user_message,
                reply=reply
            )
        except:
            pass

    # Get images & videos
    images = get_images(user_message)
    videos = get_videos(user_message)

    return JsonResponse({
        "reply": reply,
        "images": images,
        "videos": videos,
    })


# ---------------- GET HISTORY ---------------- #

@api_view(['POST'])
def get_history(request):
    user_id = request.data.get("user_id")

    if user_id in [None, "", "undefined", "null"]:
        return Response({"history": []})

    try:
        user_id = int(user_id)
    except:
        return Response({"history": []})

    chats = ChatHistory.objects.filter(
        user_id=user_id
    ).order_by("created_at")

    history = [
        {
            "message": c.message,
            "reply": c.reply,
            "time": c.created_at
        }
        for c in chats
    ]

    return Response({"history": history})


# ---------------- REGISTER ---------------- #

@api_view(["POST"])
def register_user(request):
    email = request.data.get("email")
    username = request.data.get("username")
    password = request.data.get("password")

    if User.objects.filter(email=email).exists():
        return Response({"message": "Email already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({
        "message": "Registration successful",
        "user_id": user.id
    })


# ---------------- LOGIN ---------------- #

# ---------------- LOGIN ---------------- #

@api_view(["POST"])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    # Check if email exists
    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "Invalid credentials"}, status=400)

    # Authenticate using username (Django uses username internally)
    user = authenticate(username=user_obj.username, password=password)

    if user is None:
        return Response({"message": "Invalid credentials"}, status=400)

    return Response({
        "message": "Login successful",
        "user_id": user.id
    })