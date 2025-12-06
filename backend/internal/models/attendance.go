package models

import (
	"time"

	"gorm.io/gorm"
)

type AttendanceStatus string

const (
	AttendanceStatusPresent AttendanceStatus = "Present"
	AttendanceStatusLate    AttendanceStatus = "Late"
	AttendanceStatusAbsent  AttendanceStatus = "Absent"
	AttendanceStatusLeave   AttendanceStatus = "Leave"
)

type Attendance struct {
	ID           uint             `json:"id" gorm:"primaryKey"`
	EmployeeID   uint             `json:"employee_id" gorm:"not null"`
	Employee     Employee         `json:"employee" gorm:"foreignKey:EmployeeID"`
	Date         time.Time        `json:"date" gorm:"type:date;not null"` // store just date part conceptually, but Postgres uses timestamp or date
	CheckInTime  *time.Time       `json:"check_in_time"`
	CheckOutTime *time.Time       `json:"check_out_time"`
	LocationIn   string           `json:"location_in"`  // Lat,Long or JSON
	LocationOut  string           `json:"location_out"` // Lat,Long or JSON
	Status       AttendanceStatus `json:"status"`
	WorkHours    float64          `json:"work_hours"` // Calculated hours
	Notes        string           `json:"notes"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
	DeletedAt    gorm.DeletedAt   `json:"deleted_at" gorm:"index"`
}
