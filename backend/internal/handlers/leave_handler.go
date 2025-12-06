package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// RequestLeave creates a new leave request
func RequestLeave(c *fiber.Ctx) error {
	// 1. Get Current User/Employee
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	uid := uint(userID.(float64))

	var employee models.Employee
	if err := database.DB.Where("user_id = ?", uid).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Employee profile not found"})
	}

	// 2. Parse Input
	var input struct {
		LeaveType  models.LeaveType `json:"leave_type"`
		StartDate  string           `json:"start_date"` // YYYY-MM-DD
		EndDate    string           `json:"end_date"`   // YYYY-MM-DD
		Reason     string           `json:"reason"`
		Attachment string           `json:"attachment"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	startDate, _ := time.Parse("2006-01-02", input.StartDate)
	endDate, _ := time.Parse("2006-01-02", input.EndDate)

	// Simple day calculation (inclusive)
	// For production, should skip weekends/holidays
	days := endDate.Sub(startDate).Hours()/24 + 1
	if days <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid date range"})
	}

	// 3. Check Quota (Create if not exists for this year)
	year := startDate.Year()
	var quota models.LeaveQuota
	if err := database.DB.Where("employee_id = ? AND year = ?", employee.ID, year).FirstOrCreate(&quota, models.LeaveQuota{
		EmployeeID: employee.ID,
		Year:       year,
		// Limits default in model
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Quota error"})
	}

	// 4. Validate limit
	// Note: This logic subtracts *after* approval usually, but some systems block request if potential exceeds.
	// We will allow request, check quota at approval or here. Let's check here for immediate feedback.
	// But commonly "Pending" doesn't consume quota yet.
	// Let's just create request.

	leaveRequest := models.LeaveRequest{
		EmployeeID: employee.ID,
		LeaveType:  input.LeaveType,
		StartDate:  startDate,
		EndDate:    endDate,
		TotalDays:  days,
		Reason:     input.Reason,
		Attachment: input.Attachment,
		Status:     models.LeaveStatusPending,
	}

	if err := database.DB.Create(&leaveRequest).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create request"})
	}

	return c.Status(fiber.StatusCreated).JSON(leaveRequest)
}

// GetMyLeaves lists leaves for current user
func GetMyLeaves(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	uid := uint(userID.(float64))

	var employee models.Employee
	if err := database.DB.Where("user_id = ?", uid).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Employee profile not found"})
	}

	var leaves []models.LeaveRequest
	database.DB.Where("employee_id = ?", employee.ID).Order("created_at desc").Find(&leaves)

	return c.JSON(leaves)
}

// GetPendingLeaves (Admin/Manager)
func GetPendingLeaves(c *fiber.Ctx) error {
	var leaves []models.LeaveRequest
	database.DB.Preload("Employee.User").Where("status = ?", models.LeaveStatusPending).Order("created_at asc").Find(&leaves)
	return c.JSON(leaves)
}

// ApproveRejectLeave handles approval
func ApproveRejectLeave(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))

	// Approver
	userID := c.Locals("userID")
	approverID := uint(userID.(float64))

	var input struct {
		Status  models.LeaveStatus `json:"status"` // Approved / Rejected
		Comment string             `json:"comment"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.Status != models.LeaveStatusApproved && input.Status != models.LeaveStatusRejected {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid status"})
	}

	var req models.LeaveRequest
	if err := database.DB.First(&req, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Request not found"})
	}

	if req.Status != models.LeaveStatusPending {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Request already processed"})
	}

	// Transaction for Quota update
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		req.Status = input.Status
		req.ApproverID = &approverID
		req.Comment = input.Comment

		if input.Status == models.LeaveStatusApproved {
			// Update Quota
			var quota models.LeaveQuota
			year := req.StartDate.Year()
			if err := tx.Where("employee_id = ? AND year = ?", req.EmployeeID, year).First(&quota).Error; err != nil {
				return err
			}

			switch req.LeaveType {
			case models.LeaveTypeSick:
				quota.SickLeaveUsed += req.TotalDays
			case models.LeaveTypePersonal:
				quota.PersonalLeaveUsed += req.TotalDays
			case models.LeaveTypeVacation:
				quota.VacationLeaveUsed += req.TotalDays
			}

			if err := tx.Save(&quota).Error; err != nil {
				return err
			}
		}

		if err := tx.Save(&req).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Transaction failed"})
	}

	return c.JSON(req)
}

// GetLeaveQuota get quota for Employee (My Quota)
func GetMyLeaveQuota(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	uid := uint(userID.(float64))

	var employee models.Employee
	if err := database.DB.Where("user_id = ?", uid).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Employee profile not found"})
	}

	year := time.Now().Year()
	var quota models.LeaveQuota
	if err := database.DB.Where("employee_id = ? AND year = ?", employee.ID, year).FirstOrCreate(&quota, models.LeaveQuota{
		EmployeeID: employee.ID,
		Year:       year,
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Quota error"})
	}

	return c.JSON(quota)
}
