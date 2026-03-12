from django.urls import path
from .views import chat_view, get_history
from .views import register_user, login_user


urlpatterns = [
    path('chat/', chat_view),
    path('history/', get_history),
     path('register/', register_user),
    path('login/', login_user),
    path("api/history/", get_history),

]
