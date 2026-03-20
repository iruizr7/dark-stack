from dj_rest_auth.serializers import UserModel
from rest_framework import serializers


class UserDetailsSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = (
            'pk',
            'email',
            'first_name',
            'last_name',
            'profile_photo',
        )
        read_only_fields = fields

    def get_profile_photo(self, obj):
        if not getattr(obj, 'profile_photo', None):
            return None

        request = self.context.get('request')
        photo_url = obj.profile_photo.url
        if request is None:
            return photo_url
        return request.build_absolute_uri(photo_url)
