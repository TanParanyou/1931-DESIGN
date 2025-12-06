package middleware

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

func Admin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := utils.GetUserIDFromContext(c)
		if err != nil {
			return utils.SendError(c, fiber.StatusUnauthorized, err)
		}

		var user models.User
		// Preload role to check name
		if err := database.DB.Preload("Role").First(&user, userID).Error; err != nil {
			return utils.SendError(c, fiber.StatusUnauthorized, err)
		}

		// Check if role is 'Super Admin' or 'Admin' (case insensitive or specific ID)
		// Better approach: check for specific permission e.g. "admin.access"
		// For now, let's allow "Super Admin"
		if user.Role.Name != "Super Admin" {
			return utils.SendError(c, fiber.StatusForbidden, fiber.NewError(fiber.StatusForbidden, "forbidden access"))
		}

		return c.Next()
	}
}
