package models

import "time"

type Contact struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" validate:"required,min=2,max=100"`
	Email     string    `json:"email" validate:"required,email"`
	Subject   string    `json:"subject" validate:"required,min=2,max=200"`
	Message   string    `json:"message" validate:"required,min=10"`
	CreatedAt time.Time `json:"created_at"`
}
