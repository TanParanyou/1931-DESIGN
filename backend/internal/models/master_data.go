package models

import "time"

type Department struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"unique;not null"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Position struct {
	ID           uint        `json:"id" gorm:"primaryKey"`
	Name         string      `json:"name" gorm:"not null"`
	DepartmentID *uint       `json:"department_id"`
	Department   *Department `json:"department,omitempty" gorm:"foreignKey:DepartmentID"`
	Description  string      `json:"description"`
	IsActive     bool        `json:"is_active" gorm:"default:true"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}
