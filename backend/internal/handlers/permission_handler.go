package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
	"errors"

	"github.com/gofiber/fiber/v2"
)

// GetAllPermissions godoc
// @Summary Get all permissions
// @Description Get a list of all available permissions
// @Tags Admin
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/permissions [get]
func GetAllPermissions(c *fiber.Ctx) error {
	var permissions []models.Permission
	if err := database.DB.Find(&permissions).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not fetch permissions"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"permissions": permissions,
	}, "Permissions retrieved successfully")
}
