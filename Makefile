# Makefile for Form Farsi Builder Docker operations

# Variables
IMAGE_NAME = form-farsi-builder
CONTAINER_NAME = form-farsi-builder
DEV_CONTAINER_NAME = form-farsi-builder-dev
VERSION = latest

# Help command
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  build         - Build production Docker image"
	@echo "  build-dev     - Build development Docker image" 
	@echo "  run           - Run production container"
	@echo "  run-dev       - Run development container with hot reload"
	@echo "  stop          - Stop running containers"
	@echo "  clean         - Remove containers and images"
	@echo "  logs          - Show container logs"
	@echo "  shell         - Open shell in running container"
	@echo "  up            - Start services with docker-compose"
	@echo "  up-dev        - Start development services"
	@echo "  down          - Stop all services"
	@echo "  restart       - Restart services"

# Production commands
.PHONY: build
build:
	docker build -t $(IMAGE_NAME):$(VERSION) .

.PHONY: run
run:
	docker run -d --name $(CONTAINER_NAME) -p 80:80 $(IMAGE_NAME):$(VERSION)

# Development commands
.PHONY: build-dev
build-dev:
	docker build -f Dockerfile.dev -t $(IMAGE_NAME):dev .

.PHONY: run-dev
run-dev:
	docker run -d --name $(DEV_CONTAINER_NAME) -p 5173:5173 \
		-v $$(pwd):/app -v /app/node_modules \
		$(IMAGE_NAME):dev

# Docker Compose commands
.PHONY: up
up:
	docker-compose up -d

.PHONY: up-dev
up-dev:
	docker-compose -f docker-compose.dev.yml up -d

.PHONY: down
down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

.PHONY: restart
restart:
	docker-compose restart

# Management commands
.PHONY: stop
stop:
	-docker stop $(CONTAINER_NAME) $(DEV_CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME) $(DEV_CONTAINER_NAME)

.PHONY: clean
clean: stop
	-docker rmi $(IMAGE_NAME):$(VERSION) $(IMAGE_NAME):dev
	-docker system prune -f

.PHONY: logs
logs:
	docker logs -f $(CONTAINER_NAME)

.PHONY: logs-dev
logs-dev:
	docker logs -f $(DEV_CONTAINER_NAME)

.PHONY: shell
shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh

.PHONY: shell-dev
shell-dev:
	docker exec -it $(DEV_CONTAINER_NAME) /bin/sh

# Quick setup commands
.PHONY: setup-prod
setup-prod: build up

.PHONY: setup-dev
setup-dev: build-dev up-dev

# Health check
.PHONY: health
health:
	@echo "Checking container health..."
	@docker ps --filter name=$(CONTAINER_NAME) --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 