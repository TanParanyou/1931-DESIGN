package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ========== Service Category Endpoints ==========

// GetServiceCategories - ดึงหมวดหมู่บริการของร้าน
// @Summary Get service categories
// @Tags Service
// @Security BearerAuth
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {array} models.ServiceCategory
// @Router /api/admin/businesses/{business_id}/service-categories [get]
func GetServiceCategories(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var categories []models.ServiceCategory
	database.DB.Where("business_id = ?", businessID).Order("sort_order").Find(&categories)

	return c.JSON(categories)
}

// CreateServiceCategory - สร้างหมวดหมู่บริการ
// @Summary Create service category
// @Tags Service
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Param body body models.ServiceCategory true "Category data"
// @Success 201 {object} models.ServiceCategory
// @Router /api/admin/businesses/{business_id}/service-categories [post]
func CreateServiceCategory(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var category models.ServiceCategory
	if err := c.BodyParser(&category); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	category.BusinessID = uint(businessID)
	database.DB.Create(&category)

	return c.Status(fiber.StatusCreated).JSON(category)
}

// UpdateServiceCategory - อัพเดทหมวดหมู่บริการ
// @Summary Update service category
// @Tags Service
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Param id path int true "Category ID"
// @Param body body models.ServiceCategory true "Category data"
// @Success 200 {object} models.ServiceCategory
// @Router /api/admin/businesses/{business_id}/service-categories/{id} [put]
func UpdateServiceCategory(c *fiber.Ctx) error {
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

	var category models.ServiceCategory
	if database.DB.Where("id = ? AND business_id = ?", id, businessID).First(&category).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found",
		})
	}

	var req models.ServiceCategory
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	category.NameTH = req.NameTH
	category.NameEN = req.NameEN
	category.SortOrder = req.SortOrder
	category.IsActive = req.IsActive

	database.DB.Save(&category)

	return c.JSON(category)
}

// DeleteServiceCategory - ลบหมวดหมู่บริการ
// @Summary Delete service category
// @Tags Service
// @Security BearerAuth
// @Param business_id path int true "Business ID"
// @Param id path int true "Category ID"
// @Success 200 {object} map[string]string
// @Router /api/admin/businesses/{business_id}/service-categories/{id} [delete]
func DeleteServiceCategory(c *fiber.Ctx) error {
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

	var category models.ServiceCategory
	if database.DB.Where("id = ? AND business_id = ?", id, businessID).First(&category).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found",
		})
	}

	// ลบ services ที่อยู่ในหมวดหมู่นี้ หรือ unlink
	database.DB.Model(&models.Service{}).Where("category_id = ?", id).Update("category_id", nil)
	database.DB.Delete(&category)

	return c.JSON(fiber.Map{
		"message": "Category deleted successfully",
	})
}

// ========== Service Endpoints ==========

// GetServices - ดึงรายการบริการของร้าน
// @Summary Get services
// @Tags Service
// @Security BearerAuth
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {array} models.Service
// @Router /api/admin/businesses/{business_id}/services [get]
func GetServices(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var services []models.Service
	database.DB.
		Preload("Category").
		Where("business_id = ?", businessID).
		Order("sort_order").
		Find(&services)

	return c.JSON(services)
}

// CreateService - สร้างบริการใหม่
// @Summary Create service
// @Tags Service
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Param body body models.Service true "Service data"
// @Success 201 {object} models.Service
// @Router /api/admin/businesses/{business_id}/services [post]
func CreateService(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	businessID, _ := strconv.Atoi(c.Params("business_id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", businessID, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var service models.Service
	if err := c.BodyParser(&service); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	service.BusinessID = uint(businessID)
	service.IsActive = true
	database.DB.Create(&service)

	return c.Status(fiber.StatusCreated).JSON(service)
}

// UpdateService - อัพเดทบริการ
// @Summary Update service
// @Tags Service
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Param id path int true "Service ID"
// @Param body body models.Service true "Service data"
// @Success 200 {object} models.Service
// @Router /api/admin/businesses/{business_id}/services/{id} [put]
func UpdateService(c *fiber.Ctx) error {
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

	var service models.Service
	if database.DB.Where("id = ? AND business_id = ?", id, businessID).First(&service).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Service not found",
		})
	}

	var req models.Service
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	service.CategoryID = req.CategoryID
	service.NameTH = req.NameTH
	service.NameEN = req.NameEN
	service.DescTH = req.DescTH
	service.DescEN = req.DescEN
	service.Price = req.Price
	service.PriceText = req.PriceText
	service.DurationMin = req.DurationMin
	service.ImageURL = req.ImageURL
	service.SortOrder = req.SortOrder
	service.IsActive = req.IsActive

	database.DB.Save(&service)

	return c.JSON(service)
}

// DeleteService - ลบบริการ
// @Summary Delete service
// @Tags Service
// @Security BearerAuth
// @Param business_id path int true "Business ID"
// @Param id path int true "Service ID"
// @Success 200 {object} map[string]string
// @Router /api/admin/businesses/{business_id}/services/{id} [delete]
func DeleteService(c *fiber.Ctx) error {
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

	var service models.Service
	if database.DB.Where("id = ? AND business_id = ?", id, businessID).First(&service).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Service not found",
		})
	}

	database.DB.Delete(&service)

	return c.JSON(fiber.Map{
		"message": "Service deleted successfully",
	})
}

// UpdateServicesOrder - จัดลำดับบริการ
// @Summary Update services order
// @Tags Service
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param business_id path int true "Business ID"
// @Success 200 {object} map[string]string
// @Router /api/admin/businesses/{business_id}/services/order [put]
func UpdateServicesOrder(c *fiber.Ctx) error {
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
		database.DB.Model(&models.Service{}).
			Where("id = ? AND business_id = ?", item.ID, businessID).
			Update("sort_order", item.SortOrder)
	}

	return c.JSON(fiber.Map{
		"message": "Order updated successfully",
	})
}
