package models

import "time"

type News struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title"`
	Category  string    `json:"category"`
	Date      string    `json:"date"` // Keeping as string to match frontend data for now, or could parse to time.Time
	Image     string    `json:"image"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
