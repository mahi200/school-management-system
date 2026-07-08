# School Management System

Production-oriented, open-source School Management System built with Java 17, Spring Boot, PostgreSQL, React, TypeScript, Kafka, MinIO, and Docker.

## Quick Start (any machine with Docker)

### Linux / macOS

```bash
cd school-management-system
./deploy.sh
```

Or with `make`:

```bash
make deploy
```

### Windows (PowerShell)

```powershell
cd school-management-system
.\deploy.ps1
```

### Or just Docker Compose (any OS)

If you prefer to run the steps manually:

```bash
# 1. Create .env (edit secrets as needed)
cp .env.example .env

# 2. Build and start
docker compose up -d
```

That's it. Open **http://localhost** and log in with:

| Field    | Value              |
| -------- | ------------------ |
| Email    | admin@demo.school  |
| Password | Admin@12345        |
| School   | DEMO               |

## Prerequisites

Only **Docker** (with Compose v2) is required:

- **Linux / macOS:** Docker Engine ≥ 24.x ([install](https://docs.docker.com/engine/install/))
- **Windows:** Docker Desktop ≥ 4.x ([install](https://docs.docker.com/desktop/setup/install/windows-install/))
- Docker Compose v2 (included with modern Docker Desktop / Docker Engine)

No Java, Node.js, Maven, or any other toolchain is needed on the target machine — everything builds inside Docker.

## Configuration

Copy `.env.example` to `.env` and edit:

```bash
cp .env.example .env
vi .env
```

The `deploy.sh` script does this automatically and generates secure random secrets on first run.

| Variable                    | Default              | Description                     |
| --------------------------- | -------------------- | ------------------------------- |
| `POSTGRES_DB`               | `school`             | PostgreSQL database name        |
| `POSTGRES_USER`             | `school`             | PostgreSQL user                 |
| `POSTGRES_PASSWORD`         | _(auto-generated)_   | PostgreSQL password             |
| `JWT_SECRET`                | _(auto-generated)_   | JWT signing key (≥32 chars)     |
| `JWT_ACCESS_TOKEN_MINUTES`  | `60`                 | Token expiry in minutes         |
| `MINIO_ROOT_USER`           | `minioadmin`         | MinIO admin user                |
| `MINIO_ROOT_PASSWORD`       | `minioadmin-secret`  | MinIO admin password            |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | `120`           | API rate limit                  |

## Made Easy — Commands

### Linux / macOS (with Make)

```bash
make deploy    # Full deploy: set up env + build + start
make up        # Start services (already built)
make down      # Stop all services
make restart   # Restart all services
make build     # Build Docker images
make rebuild   # Force rebuild from scratch (no cache)
make logs      # Tail logs from all services
make ps        # Show service status
make clean     # Stop + remove volumes + orphans
make prune     # Full system cleanup
```

### Windows (PowerShell)

```powershell
.\deploy.ps1                # Full deploy: set up env + build + start
docker compose up -d        # Start services (already built)
docker compose down         # Stop all services
docker compose logs -f      # Tail logs from all services
docker compose ps           # Show service status
docker compose build        # Build images
docker compose build --no-cache  # Force rebuild
```

### Any OS (Docker Compose directly)

```bash
docker compose up -d         # Start services
docker compose down          # Stop all services
docker compose logs -f       # Tail logs
docker compose ps            # Show service status
docker compose build         # Build images
docker compose build --no-cache  # Force rebuild from scratch
docker compose down -v --remove-orphans  # Stop + remove volumes
```

## Services

| Service       | Port(s)              | Purpose                    |
| ------------- | -------------------- | -------------------------- |
| Nginx         | `:80`                | Reverse proxy (entrypoint) |
| Frontend      | `:5173`              | React SPA (Nginx-alpine)   |
| Auth Service  | `:8081` → `8080`     | Spring Boot API + JWT      |
| PostgreSQL    | `:5432`              | Database                   |
| Kafka         | `:9092`              | Event bus                  |
| ZooKeeper     | `:2181`              | Kafka coordinator          |
| MinIO         | `:9000` / `:9001`    | File storage / Console UI  |

## URLs

| URL                                              | What              |
| ------------------------------------------------ | ----------------- |
| http://localhost                                  | App frontend      |
| http://localhost/api/v1/auth/health               | Auth API health   |
| http://localhost/swagger-ui/index.html            | Swagger UI        |
| http://localhost:9001                             | MinIO Console     |

## What Is Included

- Architecture and ER diagrams in [docs/architecture.md](docs/architecture.md)
- Normalized database schema in [docs/database-schema.md](docs/database-schema.md)
- Working Spring Boot `auth-service` with JWT login, registration, RBAC, Flyway, OpenAPI, rate limiting, audit logs, and health endpoints
- React + TypeScript frontend with role-aware dashboard, login, registration, Axios, Zustand, Tailwind CSS
- Docker Compose stack with PostgreSQL, Kafka, Zookeeper, MinIO, Nginx, backend, and frontend
- GitHub Actions CI pipeline for backend tests, frontend build, and Docker image build
- Multi-school architecture with `school_id` scoping on all entities

## Project Structure

```text
school-management-system/
  auth-service/       # Spring Boot backend (Java 17, Maven, JPA, Flyway)
  frontend/           # React + TypeScript UI (Tailwind, Zustand, Recharts)
  nginx/              # Reverse proxy configuration
  docs/               # Architecture, ERD, API docs
  k8s/                # Kubernetes-ready placeholders
  .github/            # CI pipeline
  docker-compose.yml  # Service orchestration
  Makefile            # Command shortcuts
  deploy.sh           # One-command deployment
  .env.example        # Environment template
```

## Service Roadmap

The current implementation uses a production-friendly modular monolith. The schema and API boundaries are ready for these services:

- `student-service`
- `teacher-service`
- `attendance-service`
- `fees-service`
- `notification-service`

Kafka topics are reserved for domain events such as `school.user.created`, `school.attendance.marked`, `school.fee.paid`, and `school.notification.requested`.
