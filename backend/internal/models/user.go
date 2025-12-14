package models

import "time"

type User struct {
	ID         uint       `json:"id" gorm:"primaryKey"`
	Username   string     `json:"username" gorm:"unique;not null"`
	Email      string     `json:"email" gorm:"unique;not null"`
	Password   string     `json:"-" gorm:"not null"` // Password is hashed, don't return in JSON
	FirstName  string     `json:"first_name"`
	LastName   string     `json:"last_name"`
	Active     bool       `json:"active" gorm:"default:true"`
	Phone      string     `json:"phone"`
	Address    string     `json:"address"`
	LineID     string     `json:"line_id"`
	Info       string     `json:"info"`
	PIN        string     `json:"-" gorm:"size:100"`                // PIN hashed เหมือน password
	PINEnabled bool       `json:"pin_enabled" gorm:"default:false"` // เปิดใช้งาน PIN login หรือไม่
	LastLogin  *time.Time `json:"last_login"`                       // เวลาล็อกอินล่าสุด
	RoleID     *uint      `json:"role_id"`
	Role       Role       `json:"role" gorm:"foreignKey:RoleID"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}
