package models

import (
	"time"
)

type Project struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	Title           string    `json:"title"`
	Location        string    `json:"location"`
	LocationMapLink string    `json:"location_map_link"`
	Owner           string    `json:"owner"`
	Category        string    `json:"category"`
	Images          []string  `json:"images" gorm:"serializer:json"` // JSON serializer for array storage
	Description     string    `json:"description"`
	Status          string    `json:"status"`
	SortOrder       int       `json:"sort_order" gorm:"default:0"`
	IsActive        bool      `json:"is_active" gorm:"default:true"`
	CreatedBy       string    `json:"created_by"`
	UpdatedBy       string    `json:"updated_by"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
