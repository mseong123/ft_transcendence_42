from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Get the JWT token from the request's cookies
        jwt_token = request.COOKIES.get('access_token')
        if not jwt_token:
            return None

        # Validate the token and retrieve the user
        validated_token = self.get_validated_token(jwt_token)

        return self.get_user(validated_token), validated_token