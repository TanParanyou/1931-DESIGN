package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

// GetProjects retrieves all projects
// GetProjects godoc
// @Summary Get all projects
// @Description Get a list of all projects
// @Tags Projects
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/projects [get]
func GetProjects(c *fiber.Ctx) error {
	var projects []models.Project
	result := database.DB.Order("sort_order asc").Find(&projects)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": result.Error.Error()})
	}
	return c.JSON(fiber.Map{"status": "success", "data": projects})
}

// GetProject retrieves a project by ID
// GetProject godoc
// @Summary Get project by ID
// @Description Get a project by ID
// @Tags Projects
// @Produce json
// @Param id path string true "Project ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/projects/{id} [get]
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
// CreateProject godoc
// @Summary Create a new project
// @Description Create a new project
// @Tags Projects
// @Accept json
// @Produce json
// @Param input body models.Project true "Project info"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/projects [post]
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
// UpdateProject godoc
// @Summary Update a project
// @Description Update a project
// @Tags Projects
// @Accept json
// @Produce json
// @Param id path string true "Project ID"
// @Param input body models.Project true "Project info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/projects/{id} [put]
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
// DeleteProject godoc
// @Summary Delete a project
// @Description Delete a project
// @Tags Projects
// @Produce json
// @Param id path string true "Project ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/projects/{id} [delete]
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
