package models

import (
	"time"

	"gorm.io/gorm"
)

type AuditLog struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `json:"user_id"`
	Action     string         `json:"action"` // e.g., USER_LOGIN, PROJECT_CREATE
	EntityID   uint           `json:"entity_id"`
	EntityType string         `json:"entity_type"`              // e.g., user, project
	Details    string         `gorm:"type:text" json:"details"` // JSON string for flexibility
	IPAddress  string         `json:"ip_address"`
	UserAgent  string         `json:"user_agent"`
	CreatedAt  time.Time      `json:"created_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
