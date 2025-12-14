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
	auth.Post("/login-pin", handlers.LoginWithPin)
	auth.Post("/register", handlers.Register)
	auth.Post("/refresh", handlers.RefreshToken)

	// Forgot password routes (public)
	auth.Post("/forgot-password", handlers.ForgotPassword)
	auth.Get("/verify-reset-token/:token", handlers.VerifyResetToken)
	auth.Post("/reset-password", handlers.ResetPassword)

	// Protected routes
	auth.Get("/profile", middleware.Protected(), handlers.GetProfile)
	auth.Put("/profile", middleware.Protected(), handlers.UpdateProfile)
	auth.Put("/change-password", middleware.Protected(), handlers.ChangePassword)
	auth.Get("/menus", middleware.Protected(), handlers.GetMenus)

	// PIN routes (protected)
	auth.Put("/pin", middleware.Protected(), handlers.SetPin)
	auth.Delete("/pin", middleware.Protected(), handlers.DisablePin)
	auth.Get("/pin-status", middleware.Protected(), handlers.GetPinStatus)

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
	roles.Get("/:id/users", handlers.GetRoleUsers) // ต้องอยู่ก่อน /:id
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

	// Dashboard Routes
	dashboard := api.Group("/dashboard", middleware.Protected())
	dashboard.Get("/stats", handlers.GetDashboardStats)
	dashboard.Get("/activities", handlers.GetRecentActivities)
	dashboard.Get("/recent-logins", handlers.GetRecentLogins)

	// Admin Cleanup Routes
	cleanup := api.Group("/admin/cleanup", middleware.Protected(), middleware.Admin())
	cleanup.Post("/images", handlers.CleanupOrphanedImages)
	cleanup.Get("/status", handlers.GetCleanupStatus)

	// Settings Routes
	api.Get("/public/settings", handlers.GetPublicSettings)

	settings := api.Group("/settings", middleware.Protected(), middleware.Admin())
	settings.Get("/", handlers.GetSettings)
	settings.Put("/", handlers.UpdateSettings)

	// ========== Business Profile System ==========

	// Public Business Profile (ไม่ต้อง login)
	api.Get("/businesses/:slug", handlers.GetBusinessBySlug)

	// Admin Business Management (ต้อง login)
	businesses := api.Group("/admin/businesses", middleware.Protected())
	businesses.Get("/", handlers.GetMyBusinesses)
	businesses.Post("/", handlers.CreateBusiness)
	businesses.Get("/:id", handlers.GetBusinessByID)
	businesses.Put("/:id", handlers.UpdateBusiness)
	businesses.Put("/:id/status", handlers.UpdateBusinessStatus)
	businesses.Delete("/:id", handlers.DeleteBusiness)

	// Business Contact & Hours
	businesses.Put("/:id/contact", handlers.UpdateBusinessContact)
	businesses.Put("/:id/hours", handlers.UpdateBusinessHours)

	// Service Categories
	businesses.Get("/:business_id/service-categories", handlers.GetServiceCategories)
	businesses.Post("/:business_id/service-categories", handlers.CreateServiceCategory)
	businesses.Put("/:business_id/service-categories/:id", handlers.UpdateServiceCategory)
	businesses.Delete("/:business_id/service-categories/:id", handlers.DeleteServiceCategory)

	// Services
	businesses.Get("/:business_id/services", handlers.GetServices)
	businesses.Post("/:business_id/services", handlers.CreateService)
	businesses.Put("/:business_id/services/order", handlers.UpdateServicesOrder)
	businesses.Put("/:business_id/services/:id", handlers.UpdateService)
	businesses.Delete("/:business_id/services/:id", handlers.DeleteService)

	// Gallery
	businesses.Get("/:business_id/gallery", handlers.GetGallery)
	businesses.Post("/:business_id/gallery", handlers.AddGalleryImage)
	businesses.Put("/:business_id/gallery/order", handlers.UpdateGalleryOrder)
	businesses.Put("/:business_id/gallery/:id", handlers.UpdateGalleryImage)
	businesses.Delete("/:business_id/gallery/:id", handlers.DeleteGalleryImage)

	// Page Config
	businesses.Get("/:business_id/page-config", handlers.GetPageConfig)
	businesses.Put("/:business_id/page-config", handlers.UpdatePageConfig)
	businesses.Put("/:business_id/page-config/theme", handlers.UpdateTheme)
	businesses.Put("/:business_id/page-config/sections", handlers.UpdateSections)
	businesses.Put("/:business_id/page-config/seo", handlers.UpdateSEO)
}
