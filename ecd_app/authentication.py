from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class ExpiringTokenAuthentication(TokenAuthentication):
    """Token authentication with server-side expiration support."""

    def authenticate_credentials(self, key):
        user_auth_tuple = super().authenticate_credentials(key)
        user, token = user_auth_tuple

        expiration_seconds = int(getattr(settings, 'TOKEN_EXPIRATION_SECONDS', 0) or 0)
        if expiration_seconds > 0:
            expiry_time = token.created + timedelta(seconds=expiration_seconds)
            if timezone.now() >= expiry_time:
                token.delete()
                raise AuthenticationFailed('Token has expired. Please log in again.')

        return user, token
