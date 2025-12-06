package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"

	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// CreateEmployee creates a new employee record
func CreateEmployee(c *fiber.Ctx) error {
	var input struct {
		UserID     uint                  `json:"user_id"`
		Position   string                `json:"position"`
		Department string                `json:"department"`
		StartDate  string                `json:"start_date"` // YYYY-MM-DD
		Status     models.EmployeeStatus `json:"status"`
		Salary     float64               `json:"salary"`
		Documents  string                `json:"documents"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Validate User exists
	var user models.User
	if err := database.DB.First(&user, input.UserID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// Check if employee record already exists for this user
	var existingEmployee models.Employee
	if err := database.DB.Where("user_id = ?", input.UserID).First(&existingEmployee).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Employee record already exists for this user"})
	}

	// Parse StartDate
	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		// handle error or default
		startDate = time.Now()
	}

	employee := models.Employee{
		UserID:     input.UserID,
		Position:   input.Position,
		Department: input.Department,
		StartDate:  startDate,
		Status:     input.Status,
		Salary:     input.Salary,
		Documents:  input.Documents,
	}

	if err := database.DB.Create(&employee).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create employee"})
	}

	// Preload User for response
	database.DB.Preload("User").First(&employee, employee.ID)

	return c.Status(fiber.StatusCreated).JSON(employee)
}

// GetEmployees lists employees with pagination
func GetEmployees(c *fiber.Ctx) error {
	var employees []models.Employee

	// Pagination
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	var total int64
	database.DB.Model(&models.Employee{}).Count(&total)

	if err := database.DB.Preload("User").Offset(offset).Limit(limit).Find(&employees).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch employees"})
	}

	return c.JSON(fiber.Map{
		"data": employees,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetEmployee retrieves a single employee by ID
func GetEmployee(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var employee models.Employee

	if err := database.DB.Preload("User").First(&employee, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Employee not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(employee)
}

// UpdateEmployee updates an employee record
func UpdateEmployee(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var employee models.Employee

	if err := database.DB.First(&employee, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Employee not found"})
	}

	var input struct {
		Position   string                `json:"position"`
		Department string                `json:"department"`
		StartDate  string                `json:"start_date"`
		Status     models.EmployeeStatus `json:"status"`
		Salary     float64               `json:"salary"`
		Documents  string                `json:"documents"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Update fields if provided
	if input.Position != "" {
		employee.Position = input.Position
	}
	if input.Department != "" {
		employee.Department = input.Department
	}
	if input.StartDate != "" {
		startDate, _ := time.Parse("2006-01-02", input.StartDate)
		employee.StartDate = startDate
	}
	if input.Status != "" {
		employee.Status = input.Status
	}
	if input.Salary != 0 {
		employee.Salary = input.Salary
	}
	if input.Documents != "" {
		employee.Documents = input.Documents
	}

	database.DB.Save(&employee)

	return c.JSON(employee)
}

// GetEmployeeByUserID retrieves employee by user ID
func GetEmployeeByUserID(c *fiber.Ctx) error {
	userID, _ := strconv.Atoi(c.Params("userId"))
	var employee models.Employee

	if err := database.DB.Preload("User").Where("user_id = ?", userID).First(&employee).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Employee profile not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(employee)
}
