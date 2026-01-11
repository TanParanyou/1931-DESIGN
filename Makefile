.PHONY: help install setup-env dev dev-frontend dev-backend seed build-frontend build-backend clean

# Colors for help message
YELLOW := \033[1;33m
NC := \033[0m # No Color

# Default target
help:
	@echo "$(YELLOW)Available commands:$(NC)"
	@echo "  make setup-env       - Copy .env.example to .env for backend"
	@echo "  make install         - Install dependencies for both frontend and backend"
	@echo "  make dev             - Run both frontend and backend concurrently"
	@echo "  make dev-frontend    - Run frontend in development mode"
	@echo "  make dev-backend     - Run backend server"
	@echo "  make seed            - Run database seed script"
	@echo "  make build-frontend  - Build frontend for production"
	@echo "  make build-backend   - Build backend binary"
	@echo "  make clean           - Remove build artifacts"

setup-env:
	cp backend/env.example backend/.env
	@echo "Created backend/.env. Please update it with your configuration."

install:
	@echo "$(YELLOW)Installing Frontend Dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(YELLOW)Installing Backend Dependencies...$(NC)"
	cd backend && go mod tidy

dev:
	@echo "$(YELLOW)Starting both services...$(NC)"
	@$(MAKE) -j2 dev-backend dev-frontend

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && go run cmd/app/main.go

seed:
	cd backend && go run cmd/seed/main.go

build-frontend:
	cd frontend && npm run build

build-backend:
	cd backend && go build -o bin/server cmd/app/main.go

clean:
	rm -rf backend/bin
	cd frontend && rm -rf .next
