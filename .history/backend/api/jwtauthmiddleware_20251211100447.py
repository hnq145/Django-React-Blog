
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
import urllib.parse

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        print("JWTAuthMiddleware: Attempting to validate token.")
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        print(f"JWTAuthMiddleware: Token is valid. User ID from token: {user_id}")
        user = User.objects.get(id=user_id)
        print(f"JWTAuthMiddleware: Successfully fetched user '{user.username}' from database.")
        return user
    except Exception as e:
        print(f"JWTAuthMiddleware: FAILED to get user. Error: {e}")
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = urllib.parse.parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            print("JWTAuthMiddleware: Token found in query string.")
            scope['user'] = await get_user(token)
        else:
            print("JWTAuthMiddleware: No token in query string. Using AnonymousUser.")
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

# A convenience wrapper for the middleware
def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
