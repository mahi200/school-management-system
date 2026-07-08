# ──────────────────────────────────────────────
# School Management System — Makefile
# ──────────────────────────────────────────────
# First-time setup:
#   cp .env.example .env   (edit secrets)
#   make deploy
# ──────────────────────────────────────────────

.PHONY: help deploy up down restart build rebuild logs ps clean prune

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

deploy: ## One-command deploy: build images + start all services
	./deploy.sh

up: ## Start all services (already built)
	docker compose up -d

down: ## Stop all services
	docker compose down

restart: down up ## Restart all services

build: ## Build all Docker images from source
	docker compose build

rebuild: ## Force rebuild all images from scratch (no cache)
	docker compose build --no-cache

logs: ## Tail logs from all services
	docker compose logs -f

ps: ## Show service status
	docker compose ps

status: ps ## Alias for ps

clean: down ## Stop and remove all containers + volumes + orphan services
	docker compose down -v --remove-orphans

prune: ## Full cleanup: containers, volumes, images, network
	docker compose down -v --remove-orphans
	docker system prune -f
