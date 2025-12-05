package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

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

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/login", handlers.Login)
	auth.Post("/register", handlers.Register)
	auth.Post("/refresh", handlers.RefreshToken)

	// Protected routes
	auth.Get("/profile", middleware.Protected(), handlers.GetProfile)
	auth.Put("/profile", middleware.Protected(), handlers.UpdateProfile)
	auth.Put("/change-password", middleware.Protected(), handlers.ChangePassword)

	// Admin User Management
	users := api.Group("/users", middleware.Protected(), middleware.Admin())
	users.Post("", handlers.CreateUser)
	users.Get("", handlers.GetAllUsers)
	users.Get("/:id", handlers.GetUserByID)
	users.Put("/:id", handlers.UpdateUserAdmin)
	users.Put("/:id/reset-password", handlers.AdminResetPassword)
	users.Delete("/:id", handlers.DeleteUser)

	// Project routes
	projects := api.Group("/projects")
	projects.Get("/", handlers.GetProjects)
	projects.Get("/:id", handlers.GetProject)
	projects.Post("/", handlers.CreateProject)
	projects.Put("/:id", handlers.UpdateProject)
	projects.Delete("/:id", handlers.DeleteProject)
}
