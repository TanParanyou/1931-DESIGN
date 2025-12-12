package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/services"
	"backend/pkg/utils"
	"errors"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// GetCategories retrieves all categories (public)
// GetCategories godoc
// @Summary Get all categories
// @Description Get a list of all active categories
// @Tags Categories
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/categories [get]
func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	if err := database.DB.Where("is_active = ?", true).Order("sort_order asc").Find(&categories).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not fetch categories"))
	}
	return utils.SendSuccess(c, categories, "Categories retrieved successfully")
}

// GetAllCategories retrieves all categories including inactive (admin)
// GetAllCategories godoc
// @Summary Get all categories (admin)
// @Description Get a list of all categories including inactive ones
// @Tags Categories
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/admin/categories [get]
func GetAllCategories(c *fiber.Ctx) error {
	var categories []models.Category
	if err := database.DB.Order("sort_order asc").Find(&categories).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not fetch categories"))
	}
	return utils.SendSuccess(c, categories, "Categories retrieved successfully")
}

// GetCategory retrieves a category by ID
// GetCategory godoc
// @Summary Get category by ID
// @Description Get a category by ID
// @Tags Categories
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/admin/categories/{id} [get]
func GetCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("category not found"))
	}
	return utils.SendSuccess(c, category, "Category retrieved successfully")
}

// CreateCategory adds a new category
// CreateCategory godoc
// @Summary Create a new category
// @Description Create a new category
// @Tags Categories
// @Accept json
// @Produce json
// @Param input body models.Category true "Category info"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/admin/categories [post]
func CreateCategory(c *fiber.Ctx) error {
	category := new(models.Category)
	if err := c.BodyParser(category); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	if category.Name == "" {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("category name is required"))
	}

	// Generate slug if not provided
	if category.Slug == "" {
		category.Slug = generateSlug(category.Name)
	}

	if err := database.DB.Create(&category).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create category"))
	}

	// Audit Log
	services.CreateAuditLog(c, "CATEGORY_CREATE", category.ID, "category", map[string]string{"name": category.Name})

	return utils.SendCreated(c, category, "Category created successfully")
}

// UpdateCategory modifies an existing category
// UpdateCategory godoc
// @Summary Update a category
// @Description Update a category
// @Tags Categories
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Param input body models.Category true "Category info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/admin/categories/{id} [put]
func UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("category not found"))
	}

	updateData := new(models.Category)
	if err := c.BodyParser(updateData); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	// Update slug if name changed and slug not provided
	if updateData.Name != "" && updateData.Name != category.Name && updateData.Slug == "" {
		updateData.Slug = generateSlug(updateData.Name)
	}

	database.DB.Model(&category).Updates(updateData)

	// Audit Log
	services.CreateAuditLog(c, "CATEGORY_UPDATE", category.ID, "category", map[string]string{"name": category.Name})

	return utils.SendSuccess(c, category, "Category updated successfully")
}

// DeleteCategory removes a category
// DeleteCategory godoc
// @Summary Delete a category
// @Description Delete a category
// @Tags Categories
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/admin/categories/{id} [delete]
func DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("category not found"))
	}

	// Check if any projects use this category
	var count int64
	database.DB.Model(&models.Project{}).Where("category = ?", category.Name).Count(&count)
	if count > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("cannot delete category with associated projects"))
	}

	database.DB.Delete(&category)

	// Audit Log
	services.CreateAuditLog(c, "CATEGORY_DELETE", category.ID, "category", map[string]string{"name": category.Name})

	return utils.SendSuccess(c, nil, "Category deleted successfully")
}

// UpdateCategoryOrder updates the sort order of categories
// UpdateCategoryOrder godoc
// @Summary Update category order
// @Description Update the sort order of multiple categories
// @Tags Categories
// @Accept json
// @Produce json
// @Param input body []map[string]interface{} true "Category order"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/admin/categories/order [put]
func UpdateCategoryOrder(c *fiber.Ctx) error {
	var orderData []struct {
		ID        uint `json:"id"`
		SortOrder int  `json:"sort_order"`
	}

	if err := c.BodyParser(&orderData); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	tx := database.DB.Begin()
	for _, item := range orderData {
		if err := tx.Model(&models.Category{}).Where("id = ?", item.ID).Update("sort_order", item.SortOrder).Error; err != nil {
			tx.Rollback()
			return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not update category order"))
		}
	}
	tx.Commit()

	return utils.SendSuccess(c, nil, "Category order updated successfully")
}

// generateSlug creates a URL-friendly slug from a string
func generateSlug(s string) string {
	// Convert to lowercase
	slug := strings.ToLower(s)
	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove special characters
	reg := regexp.MustCompile("[^a-z0-9-]")
	slug = reg.ReplaceAllString(slug, "")
	// Remove multiple hyphens
	reg = regexp.MustCompile("-+")
	slug = reg.ReplaceAllString(slug, "-")
	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")
	return slug
}
