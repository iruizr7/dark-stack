#!/usr/bin/env sh

uv run celery -A main worker --beat -Q celery -l INFO
