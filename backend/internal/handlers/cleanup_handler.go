package handlers

import (
	"backend/internal/services"
	"log"

	"github.com/gofiber/fiber/v2"
)

var cleanupService *services.CleanupService

// ============================================================
// 🔧 INITIALIZATION - เริ่มต้น Cleanup Service
// ============================================================

// InitCleanupService - เริ่มต้น cleanup service และ scheduler
// ⚠️ สำคัญ: ต้องเรียกหลังจาก R2 service initialized แล้ว
func InitCleanupService() {
	if r2Service == nil {
		log.Println("⚠️ Warning: ไม่สามารถเริ่ม cleanup service - R2 service ยังไม่พร้อม")
		return
	}
	cleanupService = services.NewCleanupService(r2Service)
	cleanupService.StartScheduler()
	log.Println("✅ Cleanup Service เริ่มทำงานแล้ว - scheduler พร้อมใช้งาน")
}

// ============================================================
// 📡 API ENDPOINTS - สำหรับ Admin
// ============================================================

// CleanupOrphanedImages - API สำหรับ cleanup orphaned images
// ⚠️ สำคัญ: ใช้ ?dry_run=true เพื่อ preview ก่อนลบจริง
//
// @Summary     ลบ orphaned images จาก R2
// @Description หารูปใน R2 ที่ไม่ได้ถูกใช้งานโดย project ใดๆ และลบออก
// @Tags        Admin
// @Produce     json
// @Param       dry_run query bool false "ถ้า true จะแค่รายงานโดยไม่ลบจริง"
// @Success     200 {object} map[string]interface{}
// @Failure     500 {object} map[string]interface{}
// @Security    BearerAuth
// @Router      /api/admin/cleanup/images [post]
func CleanupOrphanedImages(c *fiber.Ctx) error {
	// ⚠️ dry_run=true จะแค่รายงานผล ไม่ลบจริง (แนะนำให้ทดสอบก่อน)
	dryRun := c.QueryBool("dry_run", false)

	cleanupService := services.GetCleanupService()
	if cleanupService == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Cleanup service ยังไม่ได้เริ่มต้น",
		})
	}

	result, err := cleanupService.CleanupOrphanedImages(dryRun)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	message := "✅ Cleanup เสร็จสิ้น"
	if dryRun {
		message = "📋 Dry run เสร็จสิ้น (ไม่มีรูปถูกลบ - แค่รายงานผล)"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": message,
		"data":    result,
	})
}

// GetCleanupStatus - ดูสถานะ cleanup service
//
// @Summary     ดูสถานะ cleanup service
// @Description ดูข้อมูลเกี่ยวกับ cleanup service และ scheduler
// @Tags        Admin
// @Produce     json
// @Success     200 {object} map[string]interface{}
// @Security    BearerAuth
// @Router      /api/admin/cleanup/status [get]
func GetCleanupStatus(c *fiber.Ctx) error {
	cleanupService := services.GetCleanupService()

	status := "❌ ยังไม่ได้เริ่มต้น"
	if cleanupService != nil {
		status = "✅ กำลังทำงาน"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"status":      status,
			"schedule":    "0 3 * * * (ทุกวันเวลา 03:00 น.)",
			"description": "ลบรูปใน R2 ที่ไม่ได้ถูกใช้งานโดย project ใดๆ",
		},
	})
}
