from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.db import database_sync_to_async

class JWTAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Check if 'cookies' key exists in the scope
        headers = dict(scope["headers"])
        cookies = headers.get(b"cookie", b"").decode().split("; ")  # Extract and split cookie header
        parsed_cookies = {}
        for cookie in cookies:
            name, value = cookie.split("=")  # Split each cookie into name and value
            parsed_cookies[name] = value  # Store cookies in a dictionary
        cookies = parsed_cookies 
            
        if 'access_token' in cookies:
            try:
                token = cookies['access_token']
                authentication = JWTAuthentication()
                validated_token = authentication.get_validated_token(token)
                get_user_async = database_sync_to_async(authentication.get_user)
                scope['user'] = await get_user_async(validated_token)
            except Exception as e:
                print(f"Error: {e}")
        return await super().__call__(scope, receive, send)
