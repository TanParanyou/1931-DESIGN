package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

// DashboardStats represents the dashboard statistics
type DashboardStats struct {
	TotalProjects   int64 `json:"total_projects"`
	ActiveProjects  int64 `json:"active_projects"`
	TotalCategories int64 `json:"total_categories"`
	TotalUsers      int64 `json:"total_users"`
	ActiveUsers     int64 `json:"active_users"`
	TotalEmployees  int64 `json:"total_employees"`
	TodayAttendance int64 `json:"today_attendance"`
	PendingLeaves   int64 `json:"pending_leaves"`
}

// RecentActivity represents a recent activity item
type RecentActivity struct {
	ID          uint      `json:"id"`
	Action      string    `json:"action"`
	Description string    `json:"description"`
	UserID      uint      `json:"user_id"`
	Username    string    `json:"username"`
	CreatedAt   time.Time `json:"created_at"`
}

// RecentUser represents a recently logged in user
type RecentUser struct {
	ID        uint       `json:"id"`
	Username  string     `json:"username"`
	FirstName string     `json:"first_name"`
	LastName  string     `json:"last_name"`
	Role      string     `json:"role"`
	LastLogin *time.Time `json:"last_login"`
}

// GetDashboardStats godoc
// @Summary Get dashboard statistics
// @Description Get all dashboard statistics
// @Tags Dashboard
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /dashboard/stats [get]
func GetDashboardStats(c *fiber.Ctx) error {
	var stats DashboardStats

	// Total Projects
	database.DB.Model(&models.Project{}).Count(&stats.TotalProjects)

	// Active Projects (is_active = true)
	database.DB.Model(&models.Project{}).Where("is_active = ?", true).Count(&stats.ActiveProjects)

	// Total Categories
	database.DB.Model(&models.Category{}).Count(&stats.TotalCategories)

	// Total Users
	database.DB.Model(&models.User{}).Count(&stats.TotalUsers)

	// Active Users (active = true)
	database.DB.Model(&models.User{}).Where("active = ?", true).Count(&stats.ActiveUsers)

	// Total Employees
	database.DB.Model(&models.Employee{}).Count(&stats.TotalEmployees)

	// Today's Attendance
	today := time.Now().Format("2006-01-02")
	database.DB.Model(&models.Attendance{}).Where("DATE(date) = ?", today).Count(&stats.TodayAttendance)

	// Pending Leaves
	database.DB.Model(&models.LeaveRequest{}).Where("status = ?", "Pending").Count(&stats.PendingLeaves)

	return utils.SendSuccess(c, stats, "Dashboard stats retrieved successfully")
}

// GetRecentActivities godoc
// @Summary Get recent activities
// @Description Get recent audit log activities
// @Tags Dashboard
// @Security ApiKeyAuth
// @Produce json
// @Param limit query int false "Number of activities to return" default(10)
// @Success 200 {object} map[string]interface{}
// @Router /dashboard/activities [get]
func GetRecentActivities(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}

	// Simple struct for raw query result
	type ActivityRow struct {
		ID        uint      `json:"id"`
		Action    string    `json:"action"`
		ActorID   *uint     `json:"actor_id"`
		Username  *string   `json:"username"`
		CreatedAt time.Time `json:"created_at"`
	}

	var rows []ActivityRow

	// Use Raw query for better control
	database.DB.Raw(`
		SELECT al.id, al.action, al.actor_id, u.username, al.created_at 
		FROM audit_logs al 
		LEFT JOIN users u ON u.id = al.actor_id 
		ORDER BY al.created_at DESC 
		LIMIT ?
	`, limit).Scan(&rows)

	// Convert to RecentActivity with description
	activities := make([]RecentActivity, 0, len(rows))
	for _, row := range rows {
		username := ""
		if row.Username != nil {
			username = *row.Username
		}
		var userID uint
		if row.ActorID != nil {
			userID = *row.ActorID
		}

		activities = append(activities, RecentActivity{
			ID:          row.ID,
			Action:      row.Action,
			Description: formatActionDescription(row.Action),
			UserID:      userID,
			Username:    username,
			CreatedAt:   row.CreatedAt,
		})
	}

	return utils.SendSuccess(c, fiber.Map{
		"activities": activities,
	}, "Recent activities retrieved successfully")
}

// GetRecentLogins godoc
// @Summary Get recent user logins
// @Description Get users who logged in recently
// @Tags Dashboard
// @Security ApiKeyAuth
// @Produce json
// @Param limit query int false "Number of users to return" default(5)
// @Success 200 {object} map[string]interface{}
// @Router /dashboard/recent-logins [get]
func GetRecentLogins(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 5)
	if limit > 20 {
		limit = 20
	}

	var users []RecentUser

	database.DB.Model(&models.User{}).
		Select("users.id, users.username, users.first_name, users.last_name, users.last_login, roles.name as role").
		Joins("LEFT JOIN roles ON roles.id = users.role_id").
		Where("users.last_login IS NOT NULL").
		Order("users.last_login DESC").
		Limit(limit).
		Scan(&users)

	if users == nil {
		users = []RecentUser{}
	}

	return utils.SendSuccess(c, fiber.Map{
		"users": users,
	}, "Recent logins retrieved successfully")
}

// formatActionDescription formats audit log action to human readable description
func formatActionDescription(action string) string {
	descriptions := map[string]string{
		"USER_LOGIN":       "เข้าสู่ระบบ",
		"USER_LOGIN_PIN":   "เข้าสู่ระบบด้วย PIN",
		"USER_LOGOUT":      "ออกจากระบบ",
		"USER_CREATE":      "สร้างผู้ใช้ใหม่",
		"USER_UPDATE":      "แก้ไขผู้ใช้",
		"USER_DELETE":      "ลบผู้ใช้",
		"PROJECT_CREATE":   "สร้างโปรเจคใหม่",
		"PROJECT_UPDATE":   "แก้ไขโปรเจค",
		"PROJECT_DELETE":   "ลบโปรเจค",
		"CATEGORY_CREATE":  "สร้างหมวดหมู่ใหม่",
		"CATEGORY_UPDATE":  "แก้ไขหมวดหมู่",
		"CATEGORY_DELETE":  "ลบหมวดหมู่",
		"ROLE_CREATE":      "สร้างบทบาทใหม่",
		"ROLE_UPDATE":      "แก้ไขบทบาท",
		"ROLE_DELETE":      "ลบบทบาท",
		"PIN_SET":          "ตั้งค่า PIN",
		"PIN_DISABLED":     "ปิดใช้งาน PIN",
		"PASSWORD_RESET":   "รีเซ็ตรหัสผ่าน",
		"PASSWORD_CHANGED": "เปลี่ยนรหัสผ่าน",
	}

	if desc, ok := descriptions[action]; ok {
		return desc
	}
	return action
}
