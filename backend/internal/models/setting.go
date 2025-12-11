package models

import "time"

type Setting struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Key         string    `json:"key" gorm:"unique;not null"`
	Value       string    `json:"value" gorm:"type:text"`
	Type        string    `json:"type" gorm:"default:'text'"` // text, textarea, boolean, number, image
	Description string    `json:"description"`
	Group       string    `json:"group" gorm:"default:'general'"` // general, seo, contact, social
	IsPublic    bool      `json:"is_public" gorm:"default:false"` // If true, returned in public API
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
