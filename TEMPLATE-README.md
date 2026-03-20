# Dark Stack

`dark-stack` is a Copier template repository for bootstrapping projects with this stack.

## Generator

- One command generates a project.
- The Django backend is always included under `backend/`.
- The Ionic frontend can be enabled as an initial option and is generated under `frontend/`.

## Usage

Create a new project:

```bash
uvx copier copy /path/to/dark-stack /path/to/new-project
```

Example answers for a Gigtonic-like project:

```text
project_name: Gigtonic Platform
project_slug: gigtonic-platform
python_package_name: gigtonic_platform
include_frontend: true
frontend_app_name: gigtonic
capacitor_app_id: com.example.gigtonic
frontend_url: http://localhost:8100
backend_url: http://localhost:8000
```

Equivalent non-interactive command:

```bash
uvx copier copy /path/to/dark-stack /path/to/new-project \
  -d project_name="Gigtonic Platform" \
  -d project_slug="gigtonic-platform" \
  -d python_package_name="gigtonic_platform" \
  -d include_frontend=true \
  -d frontend_app_name="gigtonic" \
  -d capacitor_app_id="com.example.gigtonic" \
  -d frontend_url="http://localhost:8100" \
  -d backend_url="http://localhost:8000"
```

## Template Maintenance

Run smoke tests against the generator:

```bash
./scripts/test-template.sh backend-only
./scripts/test-template.sh backend-frontend
./scripts/test-template.sh all
```

The smoke script:

- reuses or starts a local Docker container named `dark-stack-smoke-postgres`
- exposes PostgreSQL on `localhost:5432`
- uses the template credentials: database `django`, user `django`, password `django`
- runs backend checks, migrations, and tests against that PostgreSQL instance
- runs frontend tests in `ChromeHeadless` when the frontend scenario is selected
- removes only the generated temporary project directories; the PostgreSQL container is kept for reuse

## Notes

- This repository acts as an initial project generator.
- Generated projects are expected to evolve independently after creation.
