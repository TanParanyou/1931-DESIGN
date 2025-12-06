package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

// GetMenus godoc
// @Summary Get user menus
// @Description Get menus permitted for current user
// @Tags Auth
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /auth/menus [get]
func GetMenus(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, err)
	}

	// Get User permissions
	var user models.User
	if err := database.DB.Preload("Role.Permissions").First(&user, userID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, err)
	}

	// Map permissions to map for O(1) lookup
	userPerms := make(map[string]bool)
	if user.RoleID != nil {
		for _, p := range user.Role.Permissions {
			userPerms[p.Slug] = true
		}
	}

	// Fetch all menus ordered
	var allMenus []models.Menu
	if err := database.DB.Order("\"order\" asc").Find(&allMenus).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err)
	}

	// Filter
	var visibleMenus []models.Menu
	for _, m := range allMenus {
		// If no permission required, or user has permission
		if m.PermissionSlug == "" || userPerms[m.PermissionSlug] {
			visibleMenus = append(visibleMenus, m)
		}
	}

	return utils.SendSuccess(c, fiber.Map{
		"menus": visibleMenus,
	}, "Menus retrieved successfully")
}
