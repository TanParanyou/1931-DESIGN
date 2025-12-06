package models

import (
	"time"

	"gorm.io/gorm"
)

type EmployeeStatus string

const (
	EmployeeStatusActive    EmployeeStatus = "Active"
	EmployeeStatusProbation EmployeeStatus = "Probation"
	EmployeeStatusResigned  EmployeeStatus = "Resigned"
)

type Employee struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id" gorm:"unique;not null"`
	User       User           `json:"user" gorm:"foreignKey:UserID"`
	Position   string         `json:"position"`
	Department string         `json:"department"`
	StartDate  time.Time      `json:"start_date"`
	Status     EmployeeStatus `json:"status" gorm:"default:'Probation'"`
	Salary     float64        `json:"salary"`
	Documents  string         `json:"documents" gorm:"type:text"` // JSON string for file paths
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}
