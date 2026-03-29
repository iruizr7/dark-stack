import logging

from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from templated_email import send_templated_mail

logger = logging.getLogger(__name__)


class ProjectAccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        frontend_url = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
        if not frontend_url:
            raise ImproperlyConfigured('FRONTEND_URL must be configured to send email verification emails.')

        return f'{frontend_url}/verify-email/{emailconfirmation.key}'

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        logger.info(
            'Sending account confirmation email for %s',
            emailconfirmation.email_address.email,
        )

        template_name = (
            'account/email/email_confirmation_signup'
            if signup
            else 'account/email/email_confirmation'
        )

        send_templated_mail(
            template_name=template_name,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[emailconfirmation.email_address.email],
            context={
                'user': emailconfirmation.email_address.user,
                'activate_url': self.get_email_confirmation_url(request, emailconfirmation),
            },
        )

    def send_mail(self, template_prefix, email, context):
        if template_prefix == 'account/email/password_reset_key':
            logger.info('Sending password reset email for %s', email)

            send_templated_mail(
                template_name='account/email/password_reset_key',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                context={
                    'user': context.get('user'),
                    'reset_url': context['password_reset_url'],
                },
            )
            return

        super().send_mail(template_prefix, email, context)
