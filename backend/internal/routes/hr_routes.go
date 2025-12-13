package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupHRRoutes(api fiber.Router) {
	hr := api.Group("/hr", middleware.Protected())

	// Master Data - Departments (public read, admin write)
	departments := hr.Group("/departments")
	departments.Get("/", handlers.GetDepartments)
	departments.Get("/:id", handlers.GetDepartment)
	departments.Post("/", middleware.Admin(), handlers.CreateDepartment)
	departments.Put("/:id", middleware.Admin(), handlers.UpdateDepartment)
	departments.Delete("/:id", middleware.Admin(), handlers.DeleteDepartment)

	// Master Data - Positions (public read, admin write)
	positions := hr.Group("/positions")
	positions.Get("/", handlers.GetPositions)
	positions.Get("/:id", handlers.GetPosition)
	positions.Post("/", middleware.Admin(), handlers.CreatePosition)
	positions.Put("/:id", middleware.Admin(), handlers.UpdatePosition)
	positions.Delete("/:id", middleware.Admin(), handlers.DeletePosition)

	// Users without employee record (for dropdown in employee form)
	hr.Get("/users-without-employee", middleware.Admin(), handlers.GetUsersWithoutEmployee)

	// Employees
	employees := hr.Group("/employees")
	// Only admin (or HR role) should manage employees. For now using Admin middleware
	employees.Post("/", middleware.Admin(), handlers.CreateEmployee)
	employees.Get("/", middleware.Admin(), handlers.GetEmployees)
	employees.Get("/:id", middleware.Admin(), handlers.GetEmployee)
	employees.Put("/:id", middleware.Admin(), handlers.UpdateEmployee)

	// Get own employee profile
	hr.Get("/my-employee-profile/:userId", handlers.GetEmployeeByUserID)

	// Attendance
	attendance := hr.Group("/attendance")
	attendance.Post("/check-in", handlers.CheckIn)
	attendance.Post("/check-out", handlers.CheckOut)
	attendance.Get("/history", handlers.GetAttendanceHistory)
	attendance.Get("/today", handlers.GetTodayAttendanceStatus)

	// Admin Attendance View
	hr.Get("/employees/:id/attendance", middleware.Admin(), handlers.GetEmployeeAttendance)

	// Leaves
	leaves := hr.Group("/leaves")
	leaves.Post("/", handlers.RequestLeave)
	leaves.Get("/my", handlers.GetMyLeaves)
	leaves.Get("/quota", handlers.GetMyLeaveQuota)
	leaves.Get("/pending", middleware.Admin(), handlers.GetPendingLeaves) // Admin/Manager only
	leaves.Put("/:id/approval", middleware.Admin(), handlers.ApproveRejectLeave)
}
