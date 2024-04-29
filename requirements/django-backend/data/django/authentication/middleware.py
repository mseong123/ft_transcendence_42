class RefreshTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == '/api/auth/token/refresh/':
            if 'refresh_token' in request.COOKIES:
                print("MIDDLEWARE INTERCEPTING with refresh cookie")
                mutable_data = request.POST.copy()  # Create a mutable copy
                mutable_data['refresh'] = request.COOKIES['refresh_token']  # Modify the copy
                request.POST = mutable_data  # Assign the modified copy back to request.POST
                print(request.POST['refresh'])
        response = self.get_response(request)
        return response
