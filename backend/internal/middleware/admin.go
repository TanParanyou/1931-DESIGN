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
		if err := database.DB.First(&user, userID).Error; err != nil {
			return utils.SendError(c, fiber.StatusUnauthorized, err)
		}

		if user.Role != "admin" {
			return utils.SendError(c, fiber.StatusForbidden, fiber.NewError(fiber.StatusForbidden, "forbidden access"))
		}

		return c.Next()
	}
}
