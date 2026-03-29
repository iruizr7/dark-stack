from allauth.account.utils import user_pk_to_url_str
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from dj_rest_auth.serializers import PasswordResetSerializer as DefaultPasswordResetSerializer


class PasswordResetSerializer(DefaultPasswordResetSerializer):
    def get_email_options(self):
        return {
            **super().get_email_options(),
            'url_generator': self.build_reset_url,
        }

    @staticmethod
    def build_reset_url(request, user, token):
        frontend_url = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
        if not frontend_url:
            raise ImproperlyConfigured('FRONTEND_URL must be configured to send password reset emails.')

        uid = user_pk_to_url_str(user)
        return f'{frontend_url}/reset-password/{uid}/{token}'
