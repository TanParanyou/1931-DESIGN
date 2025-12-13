package services

import (
	"backend/internal/database"
	"backend/internal/models"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/robfig/cron/v3"
)

// CleanupService - บริการจัดการ Orphaned Images
// ใช้สำหรับลบรูปภาพใน R2 ที่ไม่ได้ถูกใช้งานโดย project ใดๆ
type CleanupService struct {
	r2Service *R2Service
	scheduler *cron.Cron
}

// CleanupResult - ผลลัพธ์การ cleanup
type CleanupResult struct {
	TotalR2Images   int      `json:"total_r2_images"`        // จำนวนรูปทั้งหมดใน R2
	UsedImages      int      `json:"used_images"`            // จำนวนรูปที่ใช้งานอยู่
	OrphanedImages  int      `json:"orphaned_images"`        // จำนวนรูปที่ไม่ได้ใช้ (orphaned)
	DeletedImages   int      `json:"deleted_images"`         // จำนวนรูปที่ลบสำเร็จ
	DeletedKeys     []string `json:"deleted_keys,omitempty"` // รายการ keys ที่ลบ
	Errors          []string `json:"errors,omitempty"`       // รายการ errors (ถ้ามี)
	DurationSeconds float64  `json:"duration_seconds"`       // เวลาที่ใช้ (วินาที)
}

var cleanupServiceInstance *CleanupService

// NewCleanupService - สร้าง cleanup service instance ใหม่
func NewCleanupService(r2Service *R2Service) *CleanupService {
	cleanupServiceInstance = &CleanupService{
		r2Service: r2Service,
	}
	return cleanupServiceInstance
}

// GetCleanupService - ดึง singleton instance
func GetCleanupService() *CleanupService {
	return cleanupServiceInstance
}

// ============================================================
// 🕐 SCHEDULED JOB - ทำงานอัตโนมัติทุกวัน
// ============================================================

// StartScheduler - เริ่ม cron scheduler สำหรับ cleanup อัตโนมัติ
// ⚠️ สำคัญ: ตั้งเวลาเป็น 03:00 น. ทุกวัน เพื่อหลีกเลี่ยงช่วง peak traffic
func (c *CleanupService) StartScheduler() {
	c.scheduler = cron.New()

	// ⚠️ ตั้งเวลา cleanup - default: ทุกวันเวลา 03:00 น.
	// สามารถ override ได้ผ่าน environment variable CLEANUP_SCHEDULE
	schedule := os.Getenv("CLEANUP_SCHEDULE")
	if schedule == "" {
		schedule = "0 3 * * *" // Cron format: นาที ชั่วโมง วัน เดือน วันในสัปดาห์
	}

	_, err := c.scheduler.AddFunc(schedule, func() {
		log.Println("[Cleanup] 🚀 เริ่มต้น scheduled orphaned images cleanup...")
		result, err := c.CleanupOrphanedImages(false)
		if err != nil {
			log.Printf("[Cleanup] ❌ Error: %v\n", err)
			return
		}
		log.Printf("[Cleanup] ✅ เสร็จสิ้น: ลบ %d รูป orphaned จากทั้งหมด %d รูปใน R2\n",
			result.DeletedImages, result.TotalR2Images)
	})

	if err != nil {
		log.Printf("[Cleanup] ❌ ไม่สามารถตั้งเวลา cleanup job: %v\n", err)
		return
	}

	c.scheduler.Start()
	log.Printf("[Cleanup] ✅ Scheduler เริ่มทำงานแล้ว - schedule: %s\n", schedule)
}

// StopScheduler - หยุด scheduler
func (c *CleanupService) StopScheduler() {
	if c.scheduler != nil {
		c.scheduler.Stop()
		log.Println("[Cleanup] Scheduler หยุดทำงานแล้ว")
	}
}

// ============================================================
// 🗑️ CLEANUP LOGIC - หา และลบ orphaned images
// ============================================================

// CleanupOrphanedImages - หาและลบรูปใน R2 ที่ไม่ได้ถูกใช้งาน
// ⚠️ สำคัญ: ถ้า dryRun = true จะแค่รายงานผลโดยไม่ลบจริง
//
// ขั้นตอนการทำงาน:
// 1. ดึงรายการรูปทั้งหมดจาก R2 (prefix: projects/)
// 2. ดึง image URLs ทั้งหมดจาก database (projects table)
// 3. เปรียบเทียบหา orphaned images (อยู่ใน R2 แต่ไม่อยู่ใน DB)
// 4. ลบ orphaned images (ถ้าไม่ใช่ dry run)
func (c *CleanupService) CleanupOrphanedImages(dryRun bool) (*CleanupResult, error) {
	startTime := time.Now()
	result := &CleanupResult{}

	if c.r2Service == nil {
		return nil, fmt.Errorf("R2 service not configured")
	}

	// ============================================================
	// ขั้นตอนที่ 1: ดึงรายการรูปทั้งหมดจาก R2
	// ============================================================
	r2Keys, err := c.r2Service.ListObjects("projects/")
	if err != nil {
		return nil, fmt.Errorf("ไม่สามารถดึงรายการจาก R2: %w", err)
	}
	result.TotalR2Images = len(r2Keys)

	// ============================================================
	// ขั้นตอนที่ 2: ดึง image URLs จาก database
	// ============================================================
	var projects []models.Project
	if err := database.DB.Select("images").Find(&projects).Error; err != nil {
		return nil, fmt.Errorf("ไม่สามารถ query projects: %w", err)
	}

	// ============================================================
	// ขั้นตอนที่ 3: สร้าง set ของ keys ที่ใช้งานอยู่
	// ============================================================
	publicURL := strings.TrimSuffix(os.Getenv("R2_PUBLIC_URL"), "/")
	usedKeys := make(map[string]bool)

	for _, project := range projects {
		for _, imgURL := range project.Images {
			// แปลง URL เป็น key โดยตัด public URL prefix ออก
			// ตัวอย่าง: https://xxx.r2.dev/projects/2025/12/abc.jpg -> projects/2025/12/abc.jpg
			key := strings.TrimPrefix(imgURL, publicURL+"/")
			if key != imgURL && key != "" {
				usedKeys[key] = true
				// ⚠️ สำคัญ: mark thumbnail เป็น used ด้วย
				thumbKey := strings.Replace(key, ".", "_thumb.", 1)
				usedKeys[thumbKey] = true
			}
		}
	}
	result.UsedImages = len(usedKeys)

	// ============================================================
	// ขั้นตอนที่ 4: หา orphaned images (อยู่ใน R2 แต่ไม่อยู่ใน DB)
	// ============================================================
	var orphanedKeys []string
	for _, key := range r2Keys {
		if !usedKeys[key] {
			orphanedKeys = append(orphanedKeys, key)
		}
	}
	result.OrphanedImages = len(orphanedKeys)

	// ============================================================
	// ขั้นตอนที่ 5: ลบ orphaned images (ถ้าไม่ใช่ dry run)
	// ============================================================
	if !dryRun && len(orphanedKeys) > 0 {
		for _, key := range orphanedKeys {
			if err := c.r2Service.DeleteImage(key); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("ลบ %s ไม่สำเร็จ: %v", key, err))
			} else {
				result.DeletedImages++
				result.DeletedKeys = append(result.DeletedKeys, key)
			}
		}
	} else if dryRun {
		// Dry run: แค่รายงาน keys ที่จะลบ (ไม่ลบจริง)
		result.DeletedKeys = orphanedKeys
	}

	result.DurationSeconds = time.Since(startTime).Seconds()
	return result, nil
}
