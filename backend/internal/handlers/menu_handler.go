package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
	"errors"
	"log"

	"github.com/gofiber/fiber/v2"
)

type CreateMenuInput struct {
	Title          string `json:"title" validate:"required"`
	Path           string `json:"path" validate:"required"`
	Icon           string `json:"icon"`
	PermissionSlug string `json:"permission_slug"`
	ParentID       *uint  `json:"parent_id"`
	Order          int    `json:"order"`
}

type UpdateMenuInput struct {
	Title          string `json:"title"`
	Path           string `json:"path"`
	Icon           string `json:"icon"`
	PermissionSlug string `json:"permission_slug"`
	ParentID       *uint  `json:"parent_id"`
	Order          int    `json:"order"`
	IsActive       *bool  `json:"is_active"`
}

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

	// DEBUG: Log permissions
	log.Printf("[DEBUG] User: %s, Role: %s", user.Username, user.Role.Name)
	log.Printf("[DEBUG] Permissions: %v", userPerms)

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
		} else {
			log.Printf("[DEBUG] Hidden Menu: %s (Req: %s)", m.Title, m.PermissionSlug)
		}
	}
	log.Printf("[DEBUG] Visible Menus: %d", len(visibleMenus))

	return utils.SendSuccess(c, fiber.Map{
		"menus": visibleMenus,
	}, "Menus retrieved successfully")
}

// GetAllMenus returns all menus (Admin)
func GetAllMenus(c *fiber.Ctx) error {
	var menus []models.Menu
	if err := database.DB.Order("\"order\" asc").Find(&menus).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not fetch menus"))
	}
	return utils.SendSuccess(c, fiber.Map{"menus": menus}, "Menus retrieved successfully")
}

func GetMenu(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid menu ID"))
	}
	var menu models.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("menu not found"))
	}
	return utils.SendSuccess(c, fiber.Map{"menu": menu}, "Menu retrieved successfully")
}

func CreateMenu(c *fiber.Ctx) error {
	var input CreateMenuInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}
	menu := models.Menu{
		Title:          input.Title,
		Path:           input.Path,
		Icon:           input.Icon,
		PermissionSlug: input.PermissionSlug,
		ParentID:       input.ParentID,
		Order:          input.Order,
		IsActive:       true,
	}
	if err := database.DB.Create(&menu).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create menu"))
	}
	return utils.SendCreated(c, fiber.Map{"menu": menu}, "Menu created successfully")
}

func UpdateMenu(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid menu ID"))
	}
	var input UpdateMenuInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}
	var menu models.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("menu not found"))
	}

	if input.Title != "" {
		menu.Title = input.Title
	}
	if input.Path != "" {
		menu.Path = input.Path
	}
	if input.Icon != "" {
		menu.Icon = input.Icon
	}
	menu.PermissionSlug = input.PermissionSlug
	menu.ParentID = input.ParentID
	menu.Order = input.Order
	if input.IsActive != nil {
		menu.IsActive = *input.IsActive
	}

	if err := database.DB.Save(&menu).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not update menu"))
	}
	return utils.SendSuccess(c, fiber.Map{"menu": menu}, "Menu updated successfully")
}

func DeleteMenu(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid menu ID"))
	}
	var menu models.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("menu not found"))
	}
	if err := database.DB.Delete(&menu).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not delete menu"))
	}
	return utils.SendSuccess(c, nil, "Menu deleted successfully")
}
