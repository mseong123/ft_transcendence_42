from django.urls import re_path

from . import consumers

websocket_chat_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>[\w-]+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/pm/(?P<room_name>[\w-]+\w+)/$", consumers.PrivateChatConsumer.as_asgi()),
]