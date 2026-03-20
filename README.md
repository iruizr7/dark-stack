# Dark Stack

`dark-stack` is a Copier-based project generator for a Django backend with an optional Ionic frontend.

It is designed as an initial project bootstrapper, not as a long-term parent template that keeps updating downstream projects. The goal is to generate a clean starting point with a few intentional choices and then let the real project evolve independently.

## What It Generates

- `backend/`: Django project scaffold
- `frontend/`: optional Ionic application
- local PostgreSQL development setup through `docker-compose-dev.yaml`
- `uv`-managed Python dependencies
- template smoke tests to keep the generator healthy

## Current Options

- backend-only project
- backend + frontend project
- customizable project name and slug
- customizable Python package name
- customizable frontend app name and Capacitor app id when frontend is enabled

## Usage

Interactive:

```bash
uvx copier copy --trust /path/to/dark-stack /path/to/new-project
```

Gintonic-like example:

```bash
uvx copier copy --trust /path/to/dark-stack /path/to/new-project \
  -d project_name="Gintonic Platform" \
  -d project_slug="gintonic-platform" \
  -d python_package_name="gintonic_platform" \
  -d include_frontend=true \
  -d frontend_app_name="gintonic" \
  -d capacitor_app_id="com.example.gintonic" \
  -d frontend_url="http://localhost:8100" \
  -d backend_url="http://localhost:8000"
```

`--trust` is required because the template uses a small post-generation task to finalize the generated project README.

## Maintenance

Run template smoke tests:

```bash
./scripts/test-template.sh backend-only
./scripts/test-template.sh backend-frontend
./scripts/test-template.sh all
```

The smoke script:

- reuses or starts a local PostgreSQL service on `localhost:5432`
- prefers a Docker container named `dark-stack-smoke-postgres`
- validates Django against PostgreSQL, including migrations and test database creation
- runs frontend tests in `ChromeHeadless` when the frontend scenario is enabled
- builds the frontend in the combined scenario
- cleans up generated temporary project directories automatically
