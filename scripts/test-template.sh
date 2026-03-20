#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/test-template.sh <scenario>

Scenarios:
  backend-only
  backend-frontend
  all
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

detect_chrome_bin() {
  local candidate

  for candidate in google-chrome chromium chromium-browser google-chrome-stable; do
    if command -v "$candidate" >/dev/null 2>&1; then
      command -v "$candidate"
      return 0
    fi
  done

  echo "No Chrome/Chromium binary found for frontend tests." >&2
  exit 1
}

ensure_docker_daemon() {
  if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not available." >&2
    exit 1
  fi
}

local_postgres_is_usable() {
  docker run --rm --network host \
    -e PGPASSWORD=django \
    "$SMOKE_POSTGRES_IMAGE" \
    psql -h 127.0.0.1 -U django -d django -c 'SELECT 1' >/dev/null 2>&1
}

wait_for_postgres() {
  local attempt

  for attempt in $(seq 1 30); do
    if docker exec "$SMOKE_POSTGRES_CONTAINER" pg_isready -U django -d django >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "PostgreSQL container did not become ready in time." >&2
  exit 1
}

ensure_postgres() {
  local existing_container
  existing_container="$(docker ps -a --filter "name=^/${SMOKE_POSTGRES_CONTAINER}$" --format '{{.Names}}')"

  if [[ "$existing_container" == "$SMOKE_POSTGRES_CONTAINER" ]]; then
    if docker ps --filter "name=^/${SMOKE_POSTGRES_CONTAINER}$" --format '{{.Names}}' | grep -qx "$SMOKE_POSTGRES_CONTAINER"; then
      echo "==> Reusing PostgreSQL container: $SMOKE_POSTGRES_CONTAINER"
    else
      echo "==> Starting PostgreSQL container: $SMOKE_POSTGRES_CONTAINER"
      docker start "$SMOKE_POSTGRES_CONTAINER" >/dev/null
    fi
    wait_for_postgres
    return 0
  fi

  if local_postgres_is_usable; then
    echo "==> Reusing local PostgreSQL service on localhost:5432"
    return 0
  else
    echo "==> Creating PostgreSQL container: $SMOKE_POSTGRES_CONTAINER"
    if ! docker run -d \
      --name "$SMOKE_POSTGRES_CONTAINER" \
      -p 5432:5432 \
      -e POSTGRES_USER=django \
      -e POSTGRES_PASSWORD=django \
      -e POSTGRES_DB=django \
      -e PGDATA=/var/lib/postgresql/data/pgdata \
      "$SMOKE_POSTGRES_IMAGE" >/dev/null; then
      docker rm -f "$SMOKE_POSTGRES_CONTAINER" >/dev/null 2>&1 || true
      if local_postgres_is_usable; then
        echo "==> Reusing local PostgreSQL service on localhost:5432"
        return 0
      fi
      echo "Failed to start PostgreSQL container on localhost:5432." >&2
      echo "No reusable local PostgreSQL service with database/user/password django was found." >&2
      exit 1
    fi
  fi

  wait_for_postgres
}

run_backend_checks() {
  local project_dir="$1"

  echo "==> Running backend checks"
  uv run --directory "$project_dir" python backend/manage.py check
  uv run --directory "$project_dir" python backend/manage.py migrate --noinput
  uv run --directory "$project_dir" python backend/manage.py test
}

run_frontend_checks() {
  local project_dir="$1"

  echo "==> Installing frontend dependencies"
  (
    cd "$project_dir/frontend"
    npm install --no-fund --no-audit
  )

  echo "==> Running frontend tests"
  (
    cd "$project_dir/frontend"
    CHROME_BIN="$CHROME_BIN" npm run test -- --watch=false --browsers=ChromeHeadless
  )

  echo "==> Running frontend build"
  (
    cd "$project_dir/frontend"
    npm run build
  )
}

generate_project() {
  local project_dir="$1"
  local include_frontend="$2"

  local copier_args=(
    uvx copier copy --trust "$REPO_ROOT" "$project_dir"
    -d project_name="Template Smoke Test"
    -d project_slug="template-smoke-test"
    -d python_package_name="template_smoke_test"
    -d include_frontend="$include_frontend"
    -d frontend_url="http://localhost:8100"
    -d backend_url="http://localhost:8000"
  )

  if [[ "$include_frontend" == "true" ]]; then
    copier_args+=(
      -d frontend_app_name="template-smoke-test"
      -d capacitor_app_id="com.example.templatesmoketest"
    )
  fi

  "${copier_args[@]}"
}

run_scenario() {
  local scenario="$1"
  local include_frontend="$2"

  (
    set -euo pipefail

    local temp_dir
    temp_dir="$(mktemp -d)"
    local project_dir="$temp_dir/project"

    cleanup() {
      rm -rf "$temp_dir"
    }

    trap cleanup EXIT

    echo "==> Scenario: $scenario"
    echo "==> Temporary directory: $temp_dir"

    generate_project "$project_dir" "$include_frontend"
    run_backend_checks "$project_dir"

    if [[ "$include_frontend" == "true" ]]; then
      run_frontend_checks "$project_dir"
    fi

    echo "==> Scenario passed: $scenario"
  )
}

main() {
  if [[ $# -ne 1 ]]; then
    usage
    exit 1
  fi

  local scenario="$1"

  require_cmd uv
  require_cmd npm
  require_cmd docker
  CHROME_BIN="$(detect_chrome_bin)"
  ensure_docker_daemon
  ensure_postgres

  case "$scenario" in
    backend-only)
      run_scenario "backend-only" "false"
      ;;
    backend-frontend)
      run_scenario "backend-frontend" "true"
      ;;
    all)
      run_scenario "backend-only" "false"
      run_scenario "backend-frontend" "true"
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SMOKE_POSTGRES_CONTAINER="dark-stack-smoke-postgres"
SMOKE_POSTGRES_IMAGE="postgres:17"
CHROME_BIN=""

main "$@"
