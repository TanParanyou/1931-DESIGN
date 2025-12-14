package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ========== Gallery Endpoints ==========

// GetGallery - ดึงรูปภาพในแกลเลอรี
// @Summary Get gallery images
// @Tags Gallery
// @Security BearerAuth
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {array} models.Gallery
// @Router /api/admin/businesses/{business_id}/gallery [get]
func GetGallery(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var gallery []models.Gallery
	database.DB.Where("business_id = ?", businessID).Order("sort_order").Find(&gallery)

	return c.JSON(gallery)
}

// AddGalleryImage - เพิ่มรูปในแกลเลอรี
// @Summary Add gallery image
// @Tags Gallery
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Param body body models.Gallery true "Gallery data"
// @Success 201 {object} models.Gallery
// @Router /api/admin/businesses/{business_id}/gallery [post]
func AddGalleryImage(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var gallery models.Gallery
	if err := c.BodyParser(&gallery); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if gallery.ImageURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Image URL is required",
		})
	}

	// หา sort order สูงสุด
	var maxOrder int
	database.DB.Model(&models.Gallery{}).
		Where("business_id = ?", businessID).
		Select("COALESCE(MAX(sort_order), 0)").
		Scan(&maxOrder)

	gallery.BusinessID = uint(businessID)
	gallery.SortOrder = maxOrder + 1
	database.DB.Create(&gallery)

	return c.Status(fiber.StatusCreated).JSON(gallery)
}

// UpdateGalleryImage - อัพเดทรูปในแกลเลอรี
// @Summary Update gallery image
// @Tags Gallery
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Param id path int true "Gallery ID"
// @Param body body models.Gallery true "Gallery data"
// @Success 200 {object} models.Gallery
// @Router /api/admin/businesses/{business_id}/gallery/{id} [put]
func UpdateGalleryImage(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))
	id, _ := strconv.Atoi(c.Params("id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var gallery models.Gallery
	if database.DB.Where("id = ? AND business_id = ?", id, businessID).First(&gallery).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Gallery image not found",
		})
	}

	var req models.Gallery
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	gallery.Caption = req.Caption
	if req.ImageURL != "" {
		gallery.ImageURL = req.ImageURL
	}

	database.DB.Save(&gallery)

	return c.JSON(gallery)
}

// DeleteGalleryImage - ลบรูปจากแกลเลอรี
// @Summary Delete gallery image
// @Tags Gallery
// @Security BearerAuth
// @Param business_id path int true "Business ID"
// @Param id path int true "Gallery ID"
// @Success 200 {object} map[string]string
// @Router /api/admin/businesses/{business_id}/gallery/{id} [delete]
func DeleteGalleryImage(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))
	id, _ := strconv.Atoi(c.Params("id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var gallery models.Gallery
	if database.DB.Where("id = ? AND business_id = ?", id, businessID).First(&gallery).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Gallery image not found",
		})
	}

	database.DB.Delete(&gallery)

	return c.JSON(fiber.Map{
		"message": "Gallery image deleted successfully",
	})
}

// UpdateGalleryOrder - จัดลำดับรูปในแกลเลอรี
// @Summary Update gallery order
// @Tags Gallery
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {object} map[string]string
// @Router /api/admin/businesses/{business_id}/gallery/order [put]
func UpdateGalleryOrder(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var req []struct {
		ID        uint `json:"id"`
		SortOrder int  `json:"sort_order"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	for _, item := range req {
		database.DB.Model(&models.Gallery{}).
			Where("id = ? AND business_id = ?", item.ID, businessID).
			Update("sort_order", item.SortOrder)
	}

	return c.JSON(fiber.Map{
		"message": "Order updated successfully",
	})
}
