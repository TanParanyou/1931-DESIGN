# Go Backend with Supabase

This is the backend for the 1931-DESIGN project, built with Go, Gin, and GORM, connecting to Supabase PostgreSQL.

## Prerequisites

- Go 1.23 or higher
- Supabase project (for PostgreSQL database)

## Setup

1.  **Initialize Module** (if not already done):

    ```bash
    # Since the agent could not run this, you might need to run:
    go mod tidy
    ```

2.  **Environment Variables**:
    Copy `env.example` to `.env` and fill in your Supabase connection details.

    ```bash
    cp env.example .env
    ```

    Update `DB_URL` in `.env` with your actual connection string.

    **How to find your Supabase Connection String:**
    1.  Go to your Supabase Project Dashboard.
    2.  Click on **Project Settings** (gear icon) -> **Database**.
    3.  Under **Connection string**, select **URI**.
    4.  It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.project-ref.supabase.co:5432/postgres`
    5.  Replace `[YOUR-PASSWORD]` with your actual database password.

3.  **Run the Server**:
    ```bash
    go run cmd/api/main.go
    ```

## Structure

- `cmd/api/main.go`: Entry point of the application.
- `internal/config`: Configuration loading.
- `internal/database`: Database connection logic.
- `internal/routes`: API route definitions.
- `internal/models`: Data models (structs).
