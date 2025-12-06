package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupHRRoutes(api fiber.Router) {
	hr := api.Group("/hr", middleware.Protected())

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
