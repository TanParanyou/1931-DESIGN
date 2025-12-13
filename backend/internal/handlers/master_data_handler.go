package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ==================== DEPARTMENTS ====================

// GetDepartments returns all departments
func GetDepartments(c *fiber.Ctx) error {
	var departments []models.Department

	// Optional: filter by active status
	query := database.DB
	if c.Query("active") == "true" {
		query = query.Where("is_active = ?", true)
	}

	if err := query.Order("name ASC").Find(&departments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch departments"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    departments,
	})
}

// GetDepartment returns a single department by ID
func GetDepartment(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var department models.Department

	if err := database.DB.First(&department, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Department not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    department,
	})
}

// CreateDepartment creates a new department
func CreateDepartment(c *fiber.Ctx) error {
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IsActive    *bool  `json:"is_active"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name is required"})
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	department := models.Department{
		Name:        input.Name,
		Description: input.Description,
		IsActive:    isActive,
	}

	if err := database.DB.Create(&department).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create department"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    department,
	})
}

// UpdateDepartment updates a department
func UpdateDepartment(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var department models.Department

	if err := database.DB.First(&department, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Department not found"})
	}

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IsActive    *bool  `json:"is_active"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.Name != "" {
		department.Name = input.Name
	}
	if input.Description != "" {
		department.Description = input.Description
	}
	if input.IsActive != nil {
		department.IsActive = *input.IsActive
	}

	database.DB.Save(&department)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    department,
	})
}

// DeleteDepartment deletes a department
func DeleteDepartment(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var department models.Department

	if err := database.DB.First(&department, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Department not found"})
	}

	// Check if any positions are using this department
	var count int64
	database.DB.Model(&models.Position{}).Where("department_id = ?", id).Count(&count)
	if count > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Cannot delete department with existing positions"})
	}

	database.DB.Delete(&department)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Department deleted",
	})
}

// ==================== POSITIONS ====================

// GetPositions returns all positions
func GetPositions(c *fiber.Ctx) error {
	var positions []models.Position

	query := database.DB.Preload("Department")
	if c.Query("active") == "true" {
		query = query.Where("is_active = ?", true)
	}
	if c.Query("department_id") != "" {
		deptID, _ := strconv.Atoi(c.Query("department_id"))
		query = query.Where("department_id = ?", deptID)
	}

	if err := query.Order("name ASC").Find(&positions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch positions"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    positions,
	})
}

// GetPosition returns a single position by ID
func GetPosition(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var position models.Position

	if err := database.DB.Preload("Department").First(&position, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Position not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    position,
	})
}

// CreatePosition creates a new position
func CreatePosition(c *fiber.Ctx) error {
	var input struct {
		Name         string `json:"name"`
		DepartmentID *uint  `json:"department_id"`
		Description  string `json:"description"`
		IsActive     *bool  `json:"is_active"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name is required"})
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	position := models.Position{
		Name:         input.Name,
		DepartmentID: input.DepartmentID,
		Description:  input.Description,
		IsActive:     isActive,
	}

	if err := database.DB.Create(&position).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create position"})
	}

	// Preload department for response
	database.DB.Preload("Department").First(&position, position.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    position,
	})
}

// UpdatePosition updates a position
func UpdatePosition(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var position models.Position

	if err := database.DB.First(&position, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Position not found"})
	}

	var input struct {
		Name         string `json:"name"`
		DepartmentID *uint  `json:"department_id"`
		Description  string `json:"description"`
		IsActive     *bool  `json:"is_active"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.Name != "" {
		position.Name = input.Name
	}
	if input.DepartmentID != nil {
		position.DepartmentID = input.DepartmentID
	}
	if input.Description != "" {
		position.Description = input.Description
	}
	if input.IsActive != nil {
		position.IsActive = *input.IsActive
	}

	database.DB.Save(&position)

	// Preload department for response
	database.DB.Preload("Department").First(&position, position.ID)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    position,
	})
}

// DeletePosition deletes a position
func DeletePosition(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var position models.Position

	if err := database.DB.First(&position, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Position not found"})
	}

	database.DB.Delete(&position)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Position deleted",
	})
}

// ==================== USERS WITHOUT EMPLOYEE ====================

// GetUsersWithoutEmployee returns users that don't have employee records
func GetUsersWithoutEmployee(c *fiber.Ctx) error {
	var users []models.User

	// Subquery to find user IDs that have employee records
	subQuery := database.DB.Model(&models.Employee{}).Select("user_id")

	if err := database.DB.Where("id NOT IN (?)", subQuery).Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch users"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    users,
	})
}
