package middleware

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func CORS() fiber.Handler {
	allowOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowOrigins == "" {
		allowOrigins = "http://localhost:3000"
	}

	return cors.New(cors.Config{
		AllowOrigins: allowOrigins,
		AllowHeaders: "Origin, Content-Type, Accept",
	})
}
