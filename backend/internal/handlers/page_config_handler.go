package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ========== Page Config Endpoints ==========

// GetPageConfig - ดึง page config ของร้าน
// @Summary Get page config
// @Tags PageConfig
// @Security BearerAuth
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {object} models.PageConfig
// @Router /api/admin/businesses/{business_id}/page-config [get]
func GetPageConfig(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var config models.PageConfig
	result := database.DB.Where("business_id = ?", businessID).First(&config)
	if result.Error != nil {
		// สร้าง default config ถ้ายังไม่มี
		config = models.PageConfig{
			BusinessID:   uint(businessID),
			ThemeJSON:    `{"primary_color":"#3B82F6","secondary_color":"#1E40AF","font_family":"Inter","layout_type":"modern"}`,
			SectionsJSON: `[{"type":"hero","enabled":true,"order":1},{"type":"about","enabled":true,"order":2},{"type":"services","enabled":true,"order":3},{"type":"gallery","enabled":true,"order":4},{"type":"contact","enabled":true,"order":5}]`,
			SEOJSON:      `{}`,
		}
		database.DB.Create(&config)
	}

	return c.JSON(config)
}

// UpdatePageConfig - อัพเดท page config
// @Summary Update page config
// @Tags PageConfig
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Param body body models.PageConfig true "Page config data"
// @Success 200 {object} models.PageConfig
// @Router /api/admin/businesses/{business_id}/page-config [put]
func UpdatePageConfig(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var config models.PageConfig
	database.DB.Where("business_id = ?", businessID).First(&config)

	var req models.PageConfig
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	config.BusinessID = uint(businessID)
	if req.ThemeJSON != "" {
		config.ThemeJSON = req.ThemeJSON
	}
	if req.SectionsJSON != "" {
		config.SectionsJSON = req.SectionsJSON
	}
	if req.SEOJSON != "" {
		config.SEOJSON = req.SEOJSON
	}

	if config.ID == 0 {
		database.DB.Create(&config)
	} else {
		database.DB.Save(&config)
	}

	return c.JSON(config)
}

// UpdateTheme - อัพเดท theme เท่านั้น
// @Summary Update theme
// @Tags PageConfig
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {object} models.PageConfig
// @Router /api/admin/businesses/{business_id}/page-config/theme [put]
func UpdateTheme(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var config models.PageConfig
	database.DB.Where("business_id = ?", businessID).First(&config)

	var req struct {
		ThemeJSON string `json:"theme_json"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	config.BusinessID = uint(businessID)
	config.ThemeJSON = req.ThemeJSON

	if config.ID == 0 {
		config.SectionsJSON = `[{"type":"hero","enabled":true,"order":1},{"type":"about","enabled":true,"order":2},{"type":"services","enabled":true,"order":3},{"type":"gallery","enabled":true,"order":4},{"type":"contact","enabled":true,"order":5}]`
		config.SEOJSON = `{}`
		database.DB.Create(&config)
	} else {
		database.DB.Save(&config)
	}

	return c.JSON(config)
}

// UpdateSections - อัพเดท sections เท่านั้น
// @Summary Update sections
// @Tags PageConfig
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {object} models.PageConfig
// @Router /api/admin/businesses/{business_id}/page-config/sections [put]
func UpdateSections(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var config models.PageConfig
	database.DB.Where("business_id = ?", businessID).First(&config)

	var req struct {
		SectionsJSON string `json:"sections_json"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	config.BusinessID = uint(businessID)
	config.SectionsJSON = req.SectionsJSON

	if config.ID == 0 {
		config.ThemeJSON = `{"primary_color":"#3B82F6","secondary_color":"#1E40AF","font_family":"Inter","layout_type":"modern"}`
		config.SEOJSON = `{}`
		database.DB.Create(&config)
	} else {
		database.DB.Save(&config)
	}

	return c.JSON(config)
}

// UpdateSEO - อัพเดท SEO เท่านั้น
// @Summary Update SEO
// @Tags PageConfig
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {object} models.PageConfig
// @Router /api/admin/businesses/{business_id}/page-config/seo [put]
func UpdateSEO(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var config models.PageConfig
	database.DB.Where("business_id = ?", businessID).First(&config)

	var req struct {
		SEOJSON string `json:"seo_json"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	config.BusinessID = uint(businessID)
	config.SEOJSON = req.SEOJSON

	if config.ID == 0 {
		config.ThemeJSON = `{"primary_color":"#3B82F6","secondary_color":"#1E40AF","font_family":"Inter","layout_type":"modern"}`
		config.SectionsJSON = `[{"type":"hero","enabled":true,"order":1},{"type":"about","enabled":true,"order":2},{"type":"services","enabled":true,"order":3},{"type":"gallery","enabled":true,"order":4},{"type":"contact","enabled":true,"order":5}]`
		database.DB.Create(&config)
	} else {
		database.DB.Save(&config)
	}

	return c.JSON(config)
}
