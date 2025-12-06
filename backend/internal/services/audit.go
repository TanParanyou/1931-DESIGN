package services

import (
	"backend/internal/database"
	"backend/internal/models"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
)

func CreateAuditLog(c *fiber.Ctx, action string, entityID uint, entityType string, details interface{}, actorID ...uint) {
	// Helper to get user ID safely
	var userID uint
	if len(actorID) > 0 {
		userID = actorID[0]
	} else if c.Locals("userID") != nil {
		switch v := c.Locals("userID").(type) {
		case float64:
			userID = uint(v)
		case uint:
			userID = v
		}
	}

	detailsJSON, _ := json.Marshal(details)

	log := models.AuditLog{
		UserID:     userID,
		Action:     action,
		EntityID:   entityID,
		EntityType: entityType,
		Details:    string(detailsJSON),
		IPAddress:  c.IP(),
		UserAgent:  c.Get("User-Agent"),
		CreatedAt:  time.Now(),
	}

	// Run in background to not block response
	go func() {
		database.DB.Create(&log)
	}()
}
