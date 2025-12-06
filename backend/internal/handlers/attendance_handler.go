package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CheckInOutRequest struct {
	Location string `json:"location"` // "lat,long"
}

// CheckIn handles user check-in
func CheckIn(c *fiber.Ctx) error {
	// 1. Get User ID from Token (Assuming Middleware sets it)
	// For now, we need to find the Employee ID associated with this user.
	// Since we are not using standard auth middleware extracting yet in this snippet, let's assume we can get UserID.
	// Important: Middleware should set "userID" in locals.
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	uid, ok := userID.(float64) // JWT claims are often float64
	if !ok {
		// Try string or int if float fails?
		// Adjust based on your actual auth middleware.
		// Let's assume standard int for now if float fails, or cast.
		// If using standard fiber jwt, values are in float64.
		// For safety, let's look up Employee by user ID.
	}
	intUID := uint(uid)

	var employee models.Employee
	if err := database.DB.Where("user_id = ?", intUID).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Employee profile not found"})
	}

	var req CheckInOutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	today := time.Now().Truncate(24 * time.Hour) // Midnight today

	// Check if already checked in today
	var existing models.Attendance
	if err := database.DB.Where("employee_id = ? AND date = ?", employee.ID, today).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Already checked in today"})
	}

	now := time.Now()

	// Determine Status (Simplified logic)
	status := models.AttendanceStatusPresent
	if now.Hour() > 9 { // Late after 9 AM
		status = models.AttendanceStatusLate
	}

	attendance := models.Attendance{
		EmployeeID:  employee.ID,
		Date:        today,
		CheckInTime: &now,
		LocationIn:  req.Location,
		Status:      status,
	}

	if err := database.DB.Create(&attendance).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check in"})
	}

	return c.Status(fiber.StatusCreated).JSON(attendance)
}

// CheckOut handles user check-out
func CheckOut(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	uid := uint(userID.(float64))

	var employee models.Employee
	if err := database.DB.Where("user_id = ?", uid).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Employee profile not found"})
	}

	var req CheckInOutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	today := time.Now().Truncate(24 * time.Hour)

	var attendance models.Attendance
	if err := database.DB.Where("employee_id = ? AND date = ?", employee.ID, today).First(&attendance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "No check-in record found for today"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	if attendance.CheckOutTime != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Already checked out"})
	}

	now := time.Now()
	attendance.CheckOutTime = &now
	attendance.LocationOut = req.Location

	// Calculate Work Hours
	if attendance.CheckInTime != nil {
		duration := now.Sub(*attendance.CheckInTime)
		attendance.WorkHours = duration.Hours()
	}

	database.DB.Save(&attendance)

	return c.JSON(attendance)
}

// GetAttendanceHistory gets history for the current user
func GetAttendanceHistory(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	uid := uint(userID.(float64))

	var employee models.Employee
	if err := database.DB.Where("user_id = ?", uid).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Employee profile not found"})
	}

	var history []models.Attendance
	database.DB.Where("employee_id = ?", employee.ID).Order("date desc").Limit(30).Find(&history)

	return c.JSON(history)
}

// GetTodayAttendanceStatus gets checks if user checked in today
func GetTodayAttendanceStatus(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	uid := uint(userID.(float64))

	var employee models.Employee
	if err := database.DB.Where("user_id = ?", uid).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Employee profile not found"})
	}

	today := time.Now().Truncate(24 * time.Hour)
	var attendance models.Attendance
	if err := database.DB.Where("employee_id = ? AND date = ?", employee.ID, today).First(&attendance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(fiber.Map{"status": "Not Checked In"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	status := "Checked In"
	if attendance.CheckOutTime != nil {
		status = "Checked Out"
	}

	return c.JSON(fiber.Map{
		"status": status,
		"data":   attendance,
	})
}

// GetEmployeeAttendance (Admin)
func GetEmployeeAttendance(c *fiber.Ctx) error {
	employeeID := c.Params("id")
	var history []models.Attendance
	database.DB.Where("employee_id = ?", employeeID).Order("date desc").Limit(30).Find(&history)
	return c.JSON(history)
}
