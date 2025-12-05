package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

// GetProjects retrieves all projects
func GetProjects(c *fiber.Ctx) error {
	var projects []models.Project
	result := database.DB.Order("sort_order asc").Find(&projects)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": result.Error.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": projects})
}

// GetProject retrieves a project by ID
func GetProject(c *fiber.Ctx) error {
	id := c.Params("id")
	var project models.Project
	result := database.DB.First(&project, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Project not found"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": project})
}

// CreateProject adds a new project
func CreateProject(c *fiber.Ctx) error {
	project := new(models.Project)
	if err := c.BodyParser(project); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input"})
	}

	result := database.DB.Create(&project)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": result.Error.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"status": "success", "data": project})
}

// UpdateProject modifies an existing project
func UpdateProject(c *fiber.Ctx) error {
	id := c.Params("id")
	var project models.Project
	result := database.DB.First(&project, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Project not found"})
	}

	updateData := new(models.Project)
	if err := c.BodyParser(updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input"})
	}

	// Manually update fields to avoid zero-value issues with structs if needed,
	// or use Model(&project).Updates(updateData)
	// For simplicity using Model updates
	database.DB.Model(&project).Updates(updateData)

	return c.JSON(fiber.Map{"status": "success", "data": project})
}

// DeleteProject removes a project
func DeleteProject(c *fiber.Ctx) error {
	id := c.Params("id")
	var project models.Project
	result := database.DB.First(&project, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Project not found"})
	}

	database.DB.Delete(&project)
	return c.JSON(fiber.Map{"status": "success", "message": "Project deleted successfully"})
}
