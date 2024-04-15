"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_asgi_application()

from chatroom.routing import websocket_chat_urlpatterns
from core.middleware import JWTAuthMiddleware
from game.routing import websocket_urlpatterns
# from dj_rest_auth.jwt_auth import JWTCookieAuthentication

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = ProtocolTypeRouter(
    {
        "http": application,
		"websocket": AllowedHostsOriginValidator(
           JWTAuthMiddleware(URLRouter([
                *websocket_urlpatterns,
                *websocket_chat_urlpatterns,
                ])
            )
        ),
        # Just HTTP for now. (We can add other protocols later.)
    }
)

