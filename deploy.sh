#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# School Management System — Deployment Script
# ──────────────────────────────────────────────────────────
# Usage:  ./deploy.sh
#
# Prerequisites: Docker + Docker Compose installed
#
# This script:
#   1. Checks prerequisites
#   2. Creates .env from .env.example if missing (with auto-generated secrets)
#   3. Builds Docker images
#   4. Starts all services in the background
#   5. Waits for services to become healthy
#   6. Prints access URLs
# ──────────────────────────────────────────────────────────
set -euo pipefail

# ── Colors ───────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }
header(){ echo; echo -e "${BOLD}── $* ──${NC}"; }

# ── 1. Prerequisites ─────────────────────────────────────
header "Checking prerequisites"

if ! command -v docker &>/dev/null; then
  err "Docker is not installed."
  err "Install it from: https://docs.docker.com/engine/install/"
  exit 1
fi
ok "Docker found: $(docker --version)"

# Check Docker Compose (v2 plugin or standalone)
if docker compose version &>/dev/null; then
  COMPOSE="docker compose"
  ok "Docker Compose found: $(docker compose version)"
elif command -v docker-compose &>/dev/null; then
  COMPOSE="docker-compose"
  ok "docker-compose found: $(docker-compose --version)"
else
  err "Docker Compose is not installed."
  exit 1
fi

# ── 2. Environment file ──────────────────────────────────
header "Setting up environment"

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  warn ".env file not found — creating from .env.example"

  if [ ! -f .env.example ]; then
    err ".env.example not found! Is this the project root?"
    exit 1
  fi

  cp .env.example .env

  # Auto-generate secure secrets
  JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me-to-a-random-256-bit-secret")
  DB_PASSWORD=$(openssl rand -base64 18 2>/dev/null || echo "change-me-to-a-strong-password")

  # Replace default secrets with generated ones
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "s|change-this-to-a-random-256-bit-secret|$JWT_SECRET|" .env
    sed -i '' "s|change-me-to-a-strong-password|$DB_PASSWORD|" .env
  else
    sed -i "s|change-this-to-a-random-256-bit-secret|$JWT_SECRET|" .env
    sed -i "s|change-me-to-a-strong-password|$DB_PASSWORD|" .env
  fi

  ok ".env created with auto-generated secrets"
  echo
  warn "────────────────────────────────────────────────────"
  warn "  IMPORTANT: Review .env before continuing!"
  warn "  Edit it now if you need custom values:"
  warn "    vi .env"
  warn "────────────────────────────────────────────────────"
  echo
  read -rp "Press Enter to continue (or Ctrl+C to abort)..." _
else
  ok ".env file found"
fi

# Load environment variables
set -a; source .env; set +a

# ── 3. Build images ──────────────────────────────────────
header "Building Docker images"
echo "This may take a few minutes on first run..."

$COMPOSE build
ok "Images built"

# ── 4. Start services ────────────────────────────────────
header "Starting services"

$COMPOSE up -d
ok "All services started"

# ── 5. Wait for healthy services ─────────────────────────
header "Waiting for services to become healthy"

echo "Checking PostgreSQL..."
for i in $(seq 1 30); do
  if $COMPOSE exec -T postgres pg_isready -U "${POSTGRES_USER:-school}" -d "${POSTGRES_DB:-school}" &>/dev/null; then
    ok "PostgreSQL is ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    warn "PostgreSQL did not report ready — check logs: make logs"
  fi
  sleep 2
done

echo "Checking auth-service..."
for i in $(seq 1 60); do
  if curl -sf http://localhost:8081/actuator/health &>/dev/null; then
    ok "Auth service is healthy"
    break
  fi
  if [ "$i" -eq 60 ]; then
    warn "Auth service did not become healthy — check logs: make logs"
  fi
  sleep 2
done

# ── 6. Summary ────────────────────────────────────────────
header "Deployment Complete"

echo -e "  ${BOLD}App:${NC}          ${GREEN}http://localhost${NC}"
echo -e "  ${BOLD}Auth API:${NC}     ${GREEN}http://localhost/api/v1/auth/health${NC}"
echo -e "  ${BOLD}Swagger UI:${NC}   ${GREEN}http://localhost/swagger-ui/index.html${NC}"
echo -e "  ${BOLD}MinIO Console:${NC} ${GREEN}http://localhost:9001${NC}"
echo
echo -e "  ${BOLD}Default login:${NC}"
echo -e "    Email:    ${CYAN}admin@demo.school${NC}"
echo -e "    Password: ${CYAN}Admin@12345${NC}"
echo -e "    School:   ${CYAN}DEMO${NC}"
echo
echo -e "  ${BOLD}Useful commands:${NC}"
echo -e "    ${CYAN}make logs${NC}    — tail all logs"
echo -e "    ${CYAN}make ps${NC}      — show service status"
echo -e "    ${CYAN}make down${NC}    — stop all services"
echo -e "    ${CYAN}make restart${NC} — restart all services"
echo -e "    ${CYAN}make rebuild${NC} — rebuild from scratch"
echo

ok "Happy schooling! 🎓"
