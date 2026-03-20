import io
import tempfile
from pathlib import Path

import pyvips
from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import connection
from django.test import TestCase, override_settings


class SmokeDatabaseTestCase(TestCase):
    def test_database_connection(self):
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            result = cursor.fetchone()

        self.assertEqual(result[0], 1)


class UserModelTests(TestCase):
    def test_get_user_model_returns_custom_user(self):
        user = get_user_model().objects.create_user(
            username='template-user',
            password='secret',
        )

        self.assertEqual(user.__class__.__name__, 'User')

    def test_profile_photo_is_resized_and_converted_to_avif(self):
        image_bytes = io.BytesIO()
        Image.new('RGB', (1200, 800), color='red').save(image_bytes, format='PNG')
        image_bytes.seek(0)

        with tempfile.TemporaryDirectory() as temp_media_root:
            with override_settings(MEDIA_ROOT=temp_media_root):
                user = get_user_model().objects.create_user(
                    username='avatar-user',
                    password='secret',
                    profile_photo=SimpleUploadedFile(
                        'avatar.png',
                        image_bytes.getvalue(),
                        content_type='image/png',
                    ),
                )

                self.assertTrue(user.profile_photo.name.endswith('.avif'))

                saved_file = Path(user.profile_photo.path)
                self.assertTrue(saved_file.exists())

                output_image = pyvips.Image.new_from_file(str(saved_file))
                self.assertLessEqual(output_image.width, 300)
                self.assertLessEqual(output_image.height, 300)
