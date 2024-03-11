from datetime import timedelta
import random
from django.utils import timezone
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import AuthUser
from .serializers import AuthUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.middleware.csrf import get_token
from django.contrib.sessions.models import Session
from drf_spectacular.utils import extend_schema

def generate_random_digits(n=6):
    return "".join(map(str, random.sample(range(10), n)))

@extend_schema(
    request=AuthUserSerializer,
    responses=None
)
@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(request, email=email, password=password)

    if user is not None:
        # User credentials are valid, proceed with code generation and email sending
        my_auth, created = AuthUser.objects.get_or_create(user=user)
        
        # Generate a 6-digit code and set the expiry time to 1 hour from now
        verification_code = generate_random_digits  
        my_auth.otp = verification_code()
        my_auth.otp_expiry_time = timezone.now() + timedelta(hours=1)
        my_auth.save()

        # Send the code via email (use Django's send_mail function)
        send_mail(
            'Verification Code',
            f'Your verification code is: {my_auth.otp}',
            'ludicrouspong@gmail.com',
            [email],
            fail_silently=False,
        )
        
        response = Response({'detail': 'Verification code sent successfully.'}, status=status.HTTP_200_OK)
        csrf_token = get_token(request)
        response.set_cookie("csrftoken", csrf_token)

        return response

    return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_with_otp(request):
    email = request.data.get('email')
    password = request.data.get('password')
    otp = request.data.get('otp')

    user = authenticate(request, email=email, password=password)

    if user is not None:
        auth_user = AuthUser.objects.get(user=user)

        # Check if the verification code is valid and not expired
        if (
            auth_user.otp == otp and
            auth_user.otp_expiry_time is not None and
            auth_user.otp_expiry_time > timezone.now()
        ):
            # Verification successful, generate access and refresh tokens
            django_login(request, user)
            user.email_verified = True
            # Implement your token generation logic here

            # Use djangorestframework_simplejwt to generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Reset verification code and expiry time
            auth_user.otp = ''
            auth_user.otp_expiry_time = None
            auth_user.save()

            # Store in cookie
            response = Response({'access_token': access_token, 'refresh_token': str(refresh)}, status=status.HTTP_200_OK)
            response.set_cookie("access_token", access_token)
            response.set_cookie("refresh_token", str(refresh))
            return response

    return Response({'detail': 'Invalid verification code or credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

# Register() new auth_user & verification status
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    user_exists = User.objects.filter(email=email).exists()

    if not user_exists:
        user = User.objects.create_user(username=username, email=email, password=password)
        send_otp(request=request)
        return Response({'detail': 'User registered successfully. OTP sent for verification.'}, status=200)
    else:
        return Response({'detail': 'User with this email already exists.'}, status=400)


# Test function to verify jwt token for sensitive data
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user(request):
    try:
        user = request.user
        username = user.username
        email = user.email

        return Response({
            "username": username,
            "email": email,
        }, status=200)
    
    # does not go into catch error, because @authentication_classes already handles JWT auth
    except InvalidToken:
        return Response({"error": "INVALID_TOKEN"}, status=401)

# Next: Create global custom response class for easier parsing
# Think of login / registration flow