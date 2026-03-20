import logging

import magic
import pyvips
from django.core.files.base import ContentFile
from django.utils.crypto import get_random_string

logger = logging.getLogger(__name__)


def reduce_imagefield(instance, field, height, width, output_format):
    instance_field = getattr(instance, field)
    image_data = instance_field.read()
    file_type = magic.from_buffer(image_data, mime=True)
    logger.debug('Trying to upload profile photo in format: %s', file_type)

    if file_type not in ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif']:
        raise ValueError(f'Unsupported image format: {file_type}')

    vips_image = pyvips.Image.new_from_buffer(image_data, '', access='sequential')

    scale = min(width / vips_image.width, height / vips_image.height)
    resized = vips_image.resize(scale)

    if output_format == 'webp':
        output_bytes = resized.write_to_buffer('.webp[Q=80]')
        extension = 'webp'
    elif output_format == 'avif':
        output_bytes = resized.write_to_buffer('.avif[Q=80]')
        extension = 'avif'
    elif output_format == 'jpg':
        output_bytes = resized.write_to_buffer('.jpg[Q=80]')
        extension = 'jpg'
    else:
        raise ValueError('Unsupported output format')

    instance_field.save(
        f'{get_random_string(20)}.{extension}',
        ContentFile(output_bytes),
        save=False,
    )


def check_imagefield(field):
    return field.name is not None and len(field.name) > 0
