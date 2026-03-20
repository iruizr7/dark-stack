"""
URL configuration for main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from dj_rest_auth.registration.views import (
    RegisterView,
    ResendEmailVerificationView,
    VerifyEmailView,
)

from main.views import PasswordResetConfirmRedirectView

urlpatterns = [
    path('__admin__/', admin.site.urls),
    path('__debug2__/', include('silk.urls', namespace='silk')),
    path('accounts/', include('allauth.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path(
        'api/auth/password/reset/confirm/<str:uid>/<str:token>/',
        PasswordResetConfirmRedirectView.as_view(),
        name='password_reset_confirm',
    ),
    path('api/auth/reg/', RegisterView.as_view(), name='rest_register'),
    path('api/auth/reg/verify-email/', VerifyEmailView.as_view(), name='rest_verify_email'),
    path('api/auth/reg/resend-email/', ResendEmailVerificationView.as_view(), name='rest_resend_email'),
]

if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
    urlpatterns += [
        re_path(r'^\.well-known/(?P<path>.*)$', serve, {
            'document_root': settings.WELL_KNOWN_ROOT,
        }),
    ]
