package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"regexp"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// ========== Helper Functions ==========

// getUserIDFromToken - ดึง user ID จาก JWT token
func getUserIDFromToken(c *fiber.Ctx) uint {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	return uint(claims["user_id"].(float64))
}

// generateBusinessSlug - สร้าง slug จากชื่อ หรือใช้ custom slug
func generateBusinessSlug(name string, customSlug string) string {
	if customSlug != "" {
		return sanitizeBusinessSlug(customSlug)
	}
	return sanitizeBusinessSlug(name)
}

// sanitizeBusinessSlug - ทำความสะอาด slug
func sanitizeBusinessSlug(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	// ลบตัวอักษรที่ไม่ใช่ a-z, 0-9, -
	reg := regexp.MustCompile("[^a-z0-9-]+")
	s = reg.ReplaceAllString(s, "-")
	// ลบ - ซ้ำ
	reg = regexp.MustCompile("-+")
	s = reg.ReplaceAllString(s, "-")
	// ลบ - หน้าและหลัง
	s = strings.Trim(s, "-")
	return s
}

// ========== Public Endpoints ==========

// GetBusinessBySlug - ดึงข้อมูล business สำหรับ public
// @Summary Get business profile by slug
// @Tags Business
// @Produce json
// @Param slug path string true "Business Slug"
// @Success 200 {object} models.Business
// @Router /api/businesses/{slug} [get]
func GetBusinessBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")

	var business models.Business
	result := database.DB.
		Preload("Contact").
		Preload("Hours").
		Preload("Services", "is_active = ?", true).
		Preload("Services.Category").
		Preload("Gallery").
		Preload("PageConfig").
		Where("slug = ? AND status = ? AND is_active = ?", slug, "published", true).
		First(&business)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	return c.JSON(business)
}

// ========== Admin Endpoints ==========

// GetMyBusinesses - ดึงรายการร้านของ user
// @Summary Get my businesses
// @Tags Business
// @Security BearerAuth
// @Produce json
// @Success 200 {array} models.Business
// @Router /api/admin/businesses [get]
func GetMyBusinesses(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)

	var businesses []models.Business
	database.DB.
		Preload("Contact").
		Preload("PageConfig").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&businesses)

	return c.JSON(businesses)
}

// GetBusinessByID - ดึงข้อมูลร้านตาม ID
// @Summary Get business by ID
// @Tags Business
// @Security BearerAuth
// @Produce json
// @Param id path int true "Business ID"
// @Success 200 {object} models.Business
// @Router /api/admin/businesses/{id} [get]
func GetBusinessByID(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	id, _ := strconv.Atoi(c.Params("id"))

	var business models.Business
	result := database.DB.
		Preload("Contact").
		Preload("Hours").
		Preload("Services").
		Preload("Services.Category").
		Preload("Gallery").
		Preload("PageConfig").
		Where("id = ? AND user_id = ?", id, userID).
		First(&business)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	return c.JSON(business)
}

// CreateBusinessRequest - request body สำหรับสร้างร้าน
type CreateBusinessRequest struct {
	NameTH   string `json:"name_th"`
	NameEN   string `json:"name_en"`
	DescTH   string `json:"desc_th"`
	DescEN   string `json:"desc_en"`
	LogoURL  string `json:"logo_url"`
	CoverURL string `json:"cover_url"`
	Slug     string `json:"slug"` // optional - ถ้าไม่ใส่จะ auto generate
}

// CreateBusiness - สร้างร้านใหม่
// @Summary Create a new business
// @Tags Business
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body CreateBusinessRequest true "Business data"
// @Success 201 {object} models.Business
// @Router /api/admin/businesses [post]
func CreateBusiness(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)

	var req CreateBusinessRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate
	if req.NameTH == "" && req.NameEN == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name is required (Thai or English)",
		})
	}

	// Generate slug
	name := req.NameEN
	if name == "" {
		name = req.NameTH
	}
	slug := generateBusinessSlug(name, req.Slug)

	// Check slug uniqueness
	var existing models.Business
	if database.DB.Where("slug = ?", slug).First(&existing).Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Slug already exists",
		})
	}

	business := models.Business{
		UserID:   userID,
		Slug:     slug,
		NameTH:   req.NameTH,
		NameEN:   req.NameEN,
		DescTH:   req.DescTH,
		DescEN:   req.DescEN,
		LogoURL:  req.LogoURL,
		CoverURL: req.CoverURL,
		Status:   "draft",
		IsActive: true,
	}

	if err := database.DB.Create(&business).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create business",
		})
	}

	// สร้าง default page config
	pageConfig := models.PageConfig{
		BusinessID:   business.ID,
		ThemeJSON:    `{"primary_color":"#3B82F6","secondary_color":"#1E40AF","font_family":"Inter","layout_type":"modern"}`,
		SectionsJSON: `[{"type":"hero","enabled":true,"order":1},{"type":"about","enabled":true,"order":2},{"type":"services","enabled":true,"order":3},{"type":"gallery","enabled":true,"order":4},{"type":"contact","enabled":true,"order":5}]`,
		SEOJSON:      `{}`,
	}
	database.DB.Create(&pageConfig)

	// สร้าง default contact
	contact := models.BusinessContact{
		BusinessID: business.ID,
	}
	database.DB.Create(&contact)

	// สร้าง default hours (7 วัน)
	for i := 0; i < 7; i++ {
		hour := models.BusinessHour{
			BusinessID: business.ID,
			DayOfWeek:  i,
			OpenTime:   "09:00",
			CloseTime:  "18:00",
			IsClosed:   i == 0, // ปิดวันอาทิตย์
		}
		database.DB.Create(&hour)
	}

	return c.Status(fiber.StatusCreated).JSON(business)
}

// UpdateBusiness - อัพเดทข้อมูลร้าน
// @Summary Update business
// @Tags Business
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Business ID"
// @Param body body CreateBusinessRequest true "Business data"
// @Success 200 {object} models.Business
// @Router /api/admin/businesses/{id} [put]
func UpdateBusiness(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	id, _ := strconv.Atoi(c.Params("id"))

	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", id, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var req CreateBusinessRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Update fields
	if req.NameTH != "" {
		business.NameTH = req.NameTH
	}
	if req.NameEN != "" {
		business.NameEN = req.NameEN
	}
	business.DescTH = req.DescTH
	business.DescEN = req.DescEN
	business.LogoURL = req.LogoURL
	business.CoverURL = req.CoverURL

	// Update slug if provided
	if req.Slug != "" && req.Slug != business.Slug {
		newSlug := sanitizeBusinessSlug(req.Slug)
		var existing models.Business
		if database.DB.Where("slug = ? AND id != ?", newSlug, id).First(&existing).Error == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Slug already exists",
			})
		}
		business.Slug = newSlug
	}

	database.DB.Save(&business)

	return c.JSON(business)
}

// UpdateBusinessStatus - เปลี่ยนสถานะ draft/published
// @Summary Update business status
// @Tags Business
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Business ID"
// @Success 200 {object} models.Business
// @Router /api/admin/businesses/{id}/status [put]
func UpdateBusinessStatus(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	id, _ := strconv.Atoi(c.Params("id"))

	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", id, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var req struct {
		Status string `json:"status"` // draft, published
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Status != "draft" && req.Status != "published" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status. Must be 'draft' or 'published'",
		})
	}

	business.Status = req.Status
	database.DB.Save(&business)

	return c.JSON(business)
}

// DeleteBusiness - ลบร้าน
// @Summary Delete business
// @Tags Business
// @Security BearerAuth
// @Param id path int true "Business ID"
// @Success 200 {object} map[string]string
// @Router /api/admin/businesses/{id} [delete]
func DeleteBusiness(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	id, _ := strconv.Atoi(c.Params("id"))

	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", id, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	// ลบข้อมูลที่เกี่ยวข้องทั้งหมด
	database.DB.Where("business_id = ?", id).Delete(&models.BusinessContact{})
	database.DB.Where("business_id = ?", id).Delete(&models.BusinessHour{})
	database.DB.Where("business_id = ?", id).Delete(&models.Service{})
	database.DB.Where("business_id = ?", id).Delete(&models.ServiceCategory{})
	database.DB.Where("business_id = ?", id).Delete(&models.Gallery{})
	database.DB.Where("business_id = ?", id).Delete(&models.PageConfig{})
	database.DB.Delete(&business)

	return c.JSON(fiber.Map{
		"message": "Business deleted successfully",
	})
}

// ========== Contact Endpoints ==========

// UpdateBusinessContact - อัพเดทข้อมูลติดต่อ
// @Summary Update business contact
// @Tags Business
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Business ID"
// @Param body body models.BusinessContact true "Contact data"
// @Success 200 {object} models.BusinessContact
// @Router /api/admin/businesses/{id}/contact [put]
func UpdateBusinessContact(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	id, _ := strconv.Atoi(c.Params("id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", id, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var contact models.BusinessContact
	database.DB.Where("business_id = ?", id).First(&contact)

	var req models.BusinessContact
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Update fields
	contact.BusinessID = uint(id)
	contact.Phone = req.Phone
	contact.Email = req.Email
	contact.LineID = req.LineID
	contact.Facebook = req.Facebook
	contact.Instagram = req.Instagram
	contact.Website = req.Website
	contact.MapLat = req.MapLat
	contact.MapLng = req.MapLng
	contact.AddressTH = req.AddressTH
	contact.AddressEN = req.AddressEN

	if contact.ID == 0 {
		database.DB.Create(&contact)
	} else {
		database.DB.Save(&contact)
	}

	return c.JSON(contact)
}

// ========== Hours Endpoints ==========

// UpdateBusinessHours - อัพเดทเวลาทำการ
// @Summary Update business hours
// @Tags Business
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Business ID"
// @Param body body []models.BusinessHour true "Hours data"
// @Success 200 {array} models.BusinessHour
// @Router /api/admin/businesses/{id}/hours [put]
func UpdateBusinessHours(c *fiber.Ctx) error {
	userID := getUserIDFromToken(c)
	id, _ := strconv.Atoi(c.Params("id"))

	// ตรวจสอบว่าเป็นเจ้าของร้าน
	var business models.Business
	if database.DB.Where("id = ? AND user_id = ?", id, userID).First(&business).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Business not found",
		})
	}

	var hours []models.BusinessHour
	if err := c.BodyParser(&hours); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// ลบ hours เดิมแล้วสร้างใหม่
	database.DB.Where("business_id = ?", id).Delete(&models.BusinessHour{})

	for i := range hours {
		hours[i].BusinessID = uint(id)
		database.DB.Create(&hours[i])
	}

	// ดึง hours ที่อัพเดทแล้ว
	var updatedHours []models.BusinessHour
	database.DB.Where("business_id = ?", id).Order("day_of_week").Find(&updatedHours)

	return c.JSON(updatedHours)
}
