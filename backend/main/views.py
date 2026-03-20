from django.http import HttpResponse
from django.views import View


class PasswordResetConfirmRedirectView(View):
    def get(self, request, uid, token):
        # TODO: Replace this placeholder once the frontend password reset screen exists.
        # The reset email currently points here because dj-rest-auth requires a named
        # `password_reset_confirm` route to build the email link.
        return HttpResponse(
            (
                'Use the API endpoint at /api/auth/password/reset/confirm/ '
                'to complete this password reset.'
            ),
            content_type='text/plain',
        )
