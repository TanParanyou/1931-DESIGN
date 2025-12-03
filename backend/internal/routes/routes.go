package routes

import (
	"backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// News routes
	api.Get("/news", handlers.GetNews)
	api.Get("/news/:id", handlers.GetNewsByID)

	// Career routes
	api.Get("/careers", handlers.GetCareers)
	api.Get("/careers/:id", handlers.GetCareerByID)

	// Contact routes
	api.Post("/contact", handlers.SubmitContact)
}
