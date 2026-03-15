# Load .env for make (optional; compose and app use .env directly)
-include .env
export

# Plain progress so "make rebuild-app" doesn't hit EOF (Docker expects TTY otherwise)
export BUILDKIT_PROGRESS ?= plain

COMPOSE = docker compose
APP_SERVICE = app
DB_SERVICE = db

.PHONY: up down build rebuild-app restart-app logs logs-app ps clean help

# Start all services (creates .env from .env.example if missing)
up:
	@test -f .env || (cp .env.example .env && echo "Created .env from .env.example")
	$(COMPOSE) up -d

# Start all services in foreground
up-fg:
	@test -f .env || (cp .env.example .env && echo "Created .env from .env.example")
	$(COMPOSE) up

# Stop and remove containers
down:
	$(COMPOSE) down

# Build all images
build:
	$(COMPOSE) build --progress=plain

# Rebuild only the app image and restart the app container (quick iteration)
# --progress=plain avoids EOF when run from make (no TTY)
rebuild-app:
	$(COMPOSE) build --progress=plain --no-cache $(APP_SERVICE) && $(COMPOSE) up -d $(APP_SERVICE)

# Rebuild app (cached) and restart
rebuild-app-fast:
	$(COMPOSE) build --progress=plain $(APP_SERVICE) && $(COMPOSE) up -d $(APP_SERVICE)

# Restart app container without rebuild
restart-app:
	$(COMPOSE) restart $(APP_SERVICE)

# Restart all services
restart:
	$(COMPOSE) restart

# Logs for all services
logs:
	$(COMPOSE) logs -f

# Logs for app only
logs-app:
	$(COMPOSE) logs -f $(APP_SERVICE)

# Logs for db only
logs-db:
	$(COMPOSE) logs -f $(DB_SERVICE)

# List running containers
ps:
	$(COMPOSE) ps

# Stop containers and remove app image (keeps volume)
clean:
	$(COMPOSE) down
	$(COMPOSE) rmi $$(docker images -q '*-analyst_os_app' 2>/dev/null) 2>/dev/null || true

# Full reset: down, remove volumes, rebuild
reset:
	$(COMPOSE) down -v
	$(COMPOSE) build --progress=plain --no-cache
	$(COMPOSE) up -d

help:
	@echo "Docker Compose targets (use .env for compose and app):"
	@echo "  make up              Start all services (detached)"
	@echo "  make up-fg           Start all services (foreground)"
	@echo "  make down            Stop and remove containers"
	@echo "  make build           Build all images"
	@echo "  make rebuild-app     Rebuild app image (no cache) and restart app"
	@echo "  make rebuild-app-fast Rebuild app (cached) and restart app"
	@echo "  make restart-app     Restart app container only"
	@echo "  make restart         Restart all services"
	@echo "  make logs            Follow all logs"
	@echo "  make logs-app        Follow app logs"
	@echo "  make logs-db         Follow db logs"
	@echo "  make ps              List containers"
	@echo "  make clean           Down and remove app image"
	@echo "  make reset           Down -v, rebuild, up"
	@echo "  make help            Show this help"
