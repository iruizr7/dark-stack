from dj_rest_auth.registration.serializers import RegisterSerializer as DefaultRegisterSerializer
from rest_framework import serializers


class CustomRegisterSerializer(DefaultRegisterSerializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('username', None)

    def get_cleaned_data(self):
        return {
            'password1': self.validated_data.get('password1', ''),
            'email': self.validated_data.get('email', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        }

    def save(self, request):
        user = super().save(request)

        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.save(update_fields=['first_name', 'last_name'])

        return user
