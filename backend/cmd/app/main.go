package main

import (
	"backend/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/routes"
	"backend/pkg/middleware"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

// @title 1931-DESIGN API
// @version 1.0
// @description RESTful API for 1931-DESIGN application
// @host localhost:8080
// @BasePath /api
func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	database.ConnectDB()

	// Initialize R2 Upload Service
	if err := handlers.InitR2Service(); err != nil {
		log.Printf("Warning: R2 Service not initialized: %v", err)
		log.Println("Image uploads will not work until R2 is configured")
	} else {
		log.Println("R2 Upload Service initialized successfully")
	}

	// Initialize Fiber app
	app := fiber.New()

	// CORS Middleware
	app.Use(middleware.CORS())

	// Security Middleware
	app.Use(recover.New()) // Add Recover to prevent crashes
	app.Use(middleware.Security())
	app.Use(middleware.RateLimiter())

	// Setup routes
	routes.SetupRoutes(app)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := app.Listen(":" + port); err != nil {
		// Log fatal error if server fails to start (e.g., port in use)
		// We use panic/log.Fatal to ensure the process exits with non-zero code if wanted, or just logs it.
		// Since main exits anyway, log.Fatal is good.
		// Note: "log" must be imported. It is imported in line 4.
		// Wait, "log" is imported in line 4.
		// We use log.Fatal directly.
		panic(err)
	}
}
