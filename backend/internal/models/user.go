package models

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"unique;not null"`
	Email     string    `json:"email" gorm:"unique;not null"`
	Password  string    `json:"-" gorm:"not null"` // Password is hashed, don't return in JSON
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Role      string    `json:"role" gorm:"default:user"`
	Active    bool      `json:"active" gorm:"default:true"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	LineID    string    `json:"line_id"`
	Info      string    `json:"info"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
