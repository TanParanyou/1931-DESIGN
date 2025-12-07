package middleware

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func CORS() fiber.Handler {
	allowOrigins := os.Getenv("ALLOWED_ORIGINS")
	defaultOrigins := "http://localhost:3000, https://one931-design.onrender.com"

	if allowOrigins == "" {
		allowOrigins = defaultOrigins
	} else {
		allowOrigins = allowOrigins + ", " + defaultOrigins
	}

	return cors.New(cors.Config{
		AllowOrigins: allowOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	})
}
