package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/services"
	"backend/pkg/utils"
	"errors"

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
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Page limit" default(10)
// @Router /api/projects [get]
func GetProjects(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	offset := (page - 1) * limit

	var projects []models.Project
	var total int64

	if err := database.DB.Model(&models.Project{}).Count(&total).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not count projects"))
	}

	if err := database.DB.Order("sort_order asc").Offset(offset).Limit(limit).Find(&projects).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not fetch projects"))
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	pagination := &utils.Pagination{
		Page:        page,
		Limit:       limit,
		TotalItems:  total,
		TotalPages:  totalPages,
		HasPrevious: page > 1,
		HasNext:     page < totalPages,
	}

	return utils.SendSuccessWithPagination(c, projects, pagination, nil, "Projects retrieved successfully")
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
	if err := database.DB.First(&project, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("project not found"))
	}
	return utils.SendSuccess(c, project, "Project retrieved successfully")
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
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	if err := database.DB.Create(&project).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create project"))
	}

	// Audit Log
	services.CreateAuditLog(c, "PROJECT_CREATE", project.ID, "project", map[string]string{"title": project.Title})

	return utils.SendCreated(c, project, "Project created successfully")
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
	if err := database.DB.First(&project, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("project not found"))
	}

	updateData := new(models.Project)
	if err := c.BodyParser(updateData); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	// Manually update fields to avoid zero-value issues with structs if needed,
	// or use Model(&project).Updates(updateData)
	// For simplicity using Model updates
	database.DB.Model(&project).Updates(updateData)

	// Audit Log
	services.CreateAuditLog(c, "PROJECT_UPDATE", project.ID, "project", map[string]string{"title": project.Title})

	return utils.SendSuccess(c, project, "Project updated successfully")
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
	if err := database.DB.First(&project, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("project not found"))
	}

	// Delete images from R2 if any
	if len(project.Images) > 0 {
		// Extract keys from URLs
		var keys []string
		for _, img := range project.Images {
			keys = append(keys, img)
		}
		DeleteImages(keys)
	}

	database.DB.Delete(&project)
	// Audit Log
	services.CreateAuditLog(c, "PROJECT_DELETE", project.ID, "project", map[string]string{"title": project.Title})

	return utils.SendSuccess(c, nil, "Project deleted successfully")
}

// UpdateProjectOrder updates the sort order of projects
// UpdateProjectOrder godoc
// @Summary Update project order
// @Description Update the sort order of multiple projects
// @Tags Projects
// @Accept json
// @Produce json
// @Param input body []map[string]interface{} true "Project order"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/projects/order [put]
func UpdateProjectOrder(c *fiber.Ctx) error {
	var orderData []struct {
		ID        uint `json:"id"`
		SortOrder int  `json:"sort_order"`
	}

	if err := c.BodyParser(&orderData); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	tx := database.DB.Begin()
	for _, item := range orderData {
		if err := tx.Model(&models.Project{}).Where("id = ?", item.ID).Update("sort_order", item.SortOrder).Error; err != nil {
			tx.Rollback()
			return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not update project order"))
		}
	}
	tx.Commit()

	return utils.SendSuccess(c, nil, "Project order updated successfully")
}
