# 1931-DESIGN

## Project Structure

This repository contains both the frontend and backend for the 1931-DESIGN project.

-   **`frontend/`**: Next.js application (Client & Admin)
-   **`backend/`**: Go Fiber application (API)

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
go mod tidy
go run cmd/app/main.go
```

## Deployment

-   **Frontend**: Deploy `frontend` directory to Vercel.
-   **Backend**: Deploy `backend` directory to Render (using Docker).
