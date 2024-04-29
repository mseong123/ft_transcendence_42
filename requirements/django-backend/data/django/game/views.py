from authentication.authentication import CookieJWTAuthentication
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from game import web3
import json

# for profile.js frontend to call via API
@api_view(['POST'])
def get_tournament_info(request):
    tournamentId = request.data.get('tournamentId')
    
    info_str = web3.getTournamentInfo(tournamentId)
    if len(info_str) != 0:
        info_str = info_str.replace('\\', '')
        result = json.loads(info_str)
        return Response(result, status=200)
    else:
        return Response(info_str, status=204)