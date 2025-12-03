package main

import (
	"backend/config"
	"backend/internal/database"
	"backend/internal/routes"
	"backend/pkg/middleware"
	"os"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	database.ConnectDB()

	// Initialize Fiber app
	app := fiber.New()

	// CORS Middleware
	app.Use(middleware.CORS())

	// Security Middleware
	app.Use(middleware.Security())
	app.Use(middleware.RateLimiter())

	// Setup routes
	routes.SetupRoutes(app)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	app.Listen(":" + port)
}
