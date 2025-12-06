package models

import (
	"time"

	"gorm.io/gorm"
)

type LeaveType string
type LeaveStatus string

const (
	LeaveTypeSick     LeaveType = "Sick Leave"
	LeaveTypePersonal LeaveType = "Personal Leave"
	LeaveTypeVacation LeaveType = "Vacation Leave"
	LeaveTypeOther    LeaveType = "Other"

	LeaveStatusPending  LeaveStatus = "Pending"
	LeaveStatusApproved LeaveStatus = "Approved"
	LeaveStatusRejected LeaveStatus = "Rejected"
)

type LeaveRequest struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	EmployeeID uint           `json:"employee_id" gorm:"not null"`
	Employee   Employee       `json:"employee" gorm:"foreignKey:EmployeeID"`
	LeaveType  LeaveType      `json:"leave_type" gorm:"not null"`
	StartDate  time.Time      `json:"start_date" gorm:"type:date;not null"`
	EndDate    time.Time      `json:"end_date" gorm:"type:date;not null"`
	TotalDays  float64        `json:"total_days" gorm:"not null"`
	Reason     string         `json:"reason"`
	Attachment string         `json:"attachment"` // File URL or path
	Status     LeaveStatus    `json:"status" gorm:"default:'Pending'"`
	ApproverID *uint          `json:"approver_id"`
	Approver   *User          `json:"approver" gorm:"foreignKey:ApproverID"`
	Comment    string         `json:"comment"` // Approver comment
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

type LeaveQuota struct {
	ID                 uint      `json:"id" gorm:"primaryKey"`
	EmployeeID         uint      `json:"employee_id" gorm:"not null;uniqueIndex:idx_quota_emp_year"`
	Year               int       `json:"year" gorm:"not null;uniqueIndex:idx_quota_emp_year"`
	SickLeaveUsed      float64   `json:"sick_leave_used" gorm:"default:0"`
	SickLeaveLimit     float64   `json:"sick_leave_limit" gorm:"default:30"`
	PersonalLeaveUsed  float64   `json:"personal_leave_used" gorm:"default:0"`
	PersonalLeaveLimit float64   `json:"personal_leave_limit" gorm:"default:6"`
	VacationLeaveUsed  float64   `json:"vacation_leave_used" gorm:"default:0"`
	VacationLeaveLimit float64   `json:"vacation_leave_limit" gorm:"default:6"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}
