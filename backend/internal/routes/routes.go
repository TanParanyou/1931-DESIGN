package routes

import (
	_ "backend/docs" // Import generated docs
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Swagger Route
	api.Get("/swagger/*", swagger.HandlerDefault)

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
	auth.Get("/menus", middleware.Protected(), handlers.GetMenus)

	// Admin User Management
	users := api.Group("/users", middleware.Protected(), middleware.Admin())
	users.Post("", handlers.CreateUser)
	users.Get("", handlers.GetAllUsers)
	users.Get("/:id", handlers.GetUserByID)
	users.Put("/:id", handlers.UpdateUserAdmin)
	users.Put("/:id/reset-password", handlers.AdminResetPassword)
	users.Delete("/:id", handlers.DeleteUser)

	// Audit Logs
	api.Get("/audit-logs", middleware.Protected(), middleware.Admin(), handlers.GetAuditLogs)

	// Role & Permission Management
	roles := api.Group("/roles", middleware.Protected(), middleware.Admin())
	roles.Get("/", handlers.GetAllRoles)
	roles.Post("/", handlers.CreateRole)
	roles.Get("/:id", handlers.GetRole)
	roles.Put("/:id", handlers.UpdateRole)
	roles.Delete("/:id", handlers.DeleteRole)

	// Menu Management
	menus := api.Group("/menus", middleware.Protected(), middleware.Admin())
	menus.Get("/", handlers.GetAllMenus)
	menus.Post("/", handlers.CreateMenu)
	menus.Get("/:id", handlers.GetMenu)
	menus.Put("/:id", handlers.UpdateMenu)
	menus.Delete("/:id", handlers.DeleteMenu)

	permissions := api.Group("/permissions", middleware.Protected(), middleware.Admin())
	permissions.Get("/", handlers.GetAllPermissions)

	// Project routes (public read)
	projects := api.Group("/projects")
	projects.Get("/", handlers.GetProjects)
	projects.Get("/:id", handlers.GetProject)

	// Project routes (admin protected)
	projectsAdmin := api.Group("/projects", middleware.Protected(), middleware.Admin())
	projectsAdmin.Post("/", handlers.CreateProject)
	projectsAdmin.Put("/:id", handlers.UpdateProject)
	projectsAdmin.Delete("/:id", handlers.DeleteProject)
	projectsAdmin.Put("/order", handlers.UpdateProjectOrder)

	// Category routes (public read)
	api.Get("/categories", handlers.GetCategories)

	// Category routes (admin protected)
	categories := api.Group("/categories", middleware.Protected(), middleware.Admin())
	categories.Get("/all", handlers.GetAllCategories)
	categories.Get("/:id", handlers.GetCategory)
	categories.Post("/", handlers.CreateCategory)
	categories.Put("/order", handlers.UpdateCategoryOrder)
	categories.Put("/:id", handlers.UpdateCategory)
	categories.Delete("/:id", handlers.DeleteCategory)

	// Upload routes (admin protected)
	upload := api.Group("/upload", middleware.Protected(), middleware.Admin())
	upload.Post("/image", handlers.UploadImage)
	upload.Delete("/image/*", handlers.DeleteImage)

	// HR Routes
	SetupHRRoutes(api)

	// Settings Routes
	api.Get("/public/settings", handlers.GetPublicSettings)

	settings := api.Group("/settings", middleware.Protected(), middleware.Admin())
	settings.Get("/", handlers.GetSettings)
	settings.Put("/", handlers.UpdateSettings)
}
