package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetSettings (Admin) - Returns all settings
// @Summary Get all settings (Admin)
// @Description Get all system settings (key-value pairs)
// @Tags Setting
// @Accept json
// @Produce json
// @Success 200 {array} models.Setting
// @Router /settings [get]
func GetSettings(c *fiber.Ctx) error {
	var settings []models.Setting
	if err := database.DB.Find(&settings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch settings"})
	}
	return c.JSON(settings)
}

// UpdateSettings (Admin) - Batch update settings
// @Summary Update settings (Admin)
// @Description Batch update multiple settings
// @Tags Setting
// @Accept json
// @Produce json
// @Param settings body []models.Setting true "List of settings to update"
// @Success 200 {object} map[string]string
// @Router /settings [put]
func UpdateSettings(c *fiber.Ctx) error {
	var input []models.Setting
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	return database.DB.Transaction(func(tx *gorm.DB) error {
		for _, s := range input {
			// Use 'tx' instead of 'database.DB' for transaction
			if err := tx.Model(&models.Setting{}).Where("key = ?", s.Key).Select("Value", "IsPublic").Updates(models.Setting{Value: s.Value, IsPublic: s.IsPublic}).Error; err != nil {
				// Return error to rollback transaction
				return err
			}
		}
		// Return nil to commit transaction
		return nil
	})
}

// GetPublicSettings (Public) - Returns only public settings
// @Summary Get public settings
// @Description Get public system settings (site title, SEO, etc.)
// @Tags Public
// @Accept json
// @Produce json
// @Success 200 {object} map[string]string
// @Router /public/settings [get]
func GetPublicSettings(c *fiber.Ctx) error {
	var settings []models.Setting
	if err := database.DB.Where("is_public = ?", true).Find(&settings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch settings"})
	}

	// Maybe return as key-value map for easier usage on frontend?
	// Or just return array. Array is more robust if we want to include Types/Descriptions later.
	// But for simple "Layout" usage, a map is nice.
	// Let's return a map for public endpoint for easier consumption.
	settingsMap := make(map[string]string)
	for _, s := range settings {
		settingsMap[s.Key] = s.Value
	}

	return c.JSON(settingsMap)
}
