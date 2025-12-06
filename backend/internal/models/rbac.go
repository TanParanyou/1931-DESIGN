package models

import "time"

type Role struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	Name        string       `json:"name" gorm:"unique;not null"`
	Description string       `json:"description"`
	Permissions []Permission `json:"permissions" gorm:"many2many:role_permissions;"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

type Permission struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Slug        string    `json:"slug" gorm:"unique;not null"` // e.g. "users.view"
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Menu struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	Title          string    `json:"title" gorm:"not null"` // Display name
	Path           string    `json:"path" gorm:"not null"`
	Icon           string    `json:"icon"`            // Lucide icon name
	PermissionSlug string    `json:"permission_slug"` // Required permission to view
	ParentID       *uint     `json:"parent_id"`
	Order          int       `json:"order" gorm:"default:0"`
	IsActive       bool      `json:"is_active" gorm:"default:true"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Children       []Menu    `json:"children" gorm:"foreignKey:ParentID"`
}
