package main

import (
	"backend/config"
	"backend/internal/database"
	"backend/internal/routes"
	"backend/pkg/middleware"
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
	app.Listen(":" + port)
}
