package middleware

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

// Admin middleware ตรวจสอบว่า user มี permission "admin.access" หรือไม่
// ใช้ permission-based แทนการ hardcode role name
func Admin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := utils.GetUserIDFromContext(c)
		if err != nil {
			return utils.SendError(c, fiber.StatusUnauthorized, err)
		}

		var user models.User
		// Preload role พร้อม permissions
		if err := database.DB.Preload("Role.Permissions").First(&user, userID).Error; err != nil {
			return utils.SendError(c, fiber.StatusUnauthorized, err)
		}

		// ตรวจสอบว่า user มี permission "admin.access" หรือไม่
		hasAdminAccess := false
		if user.Role.Permissions != nil {
			for _, perm := range user.Role.Permissions {
				if perm.Slug == "admin.access" {
					hasAdminAccess = true
					break
				}
			}
		}

		if !hasAdminAccess {
			return utils.SendError(c, fiber.StatusForbidden, fiber.NewError(fiber.StatusForbidden, "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ กรุณาติดต่อผู้ดูแลระบบ"))
		}

		return c.Next()
	}
}
