package database

import (
	"log"
	"os"
	"strings"
	"time"

	"backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		log.Fatal("DB_URL environment variable not set")
	}

	// Append default_query_exec_mode=simple_protocol to support Supabase transaction pooler
	// This avoids "prepared statement already exists" errors
	if !strings.Contains(dsn, "default_query_exec_mode") {
		if strings.Contains(dsn, "?") {
			dsn += "&default_query_exec_mode=simple_protocol"
		} else {
			dsn += "?default_query_exec_mode=simple_protocol"
		}
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Connected to Supabase PostgreSQL database successfully")

	// Auto Migrate
	err = DB.AutoMigrate(
		&models.Role{}, &models.Permission{}, &models.Menu{}, // RBAC tables
		&models.News{}, &models.Career{}, &models.Contact{}, &models.Project{}, &models.User{}, &models.AuditLog{},
		&models.Employee{}, &models.Attendance{},
		&models.LeaveRequest{}, &models.LeaveQuota{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	log.Println("Database migration completed")

	// Seed RBAC Data
	seedRBAC()
}

func seedRBAC() {
	// 1. Create Permissions
	permissions := []models.Permission{
		{Slug: "dashboard.view", Description: "View Dashboard"},
		{Slug: "users.view", Description: "View Users"},
		{Slug: "users.manage", Description: "Create, Edit, Delete Users"},
		{Slug: "roles.view", Description: "View Roles"},
		{Slug: "roles.manage", Description: "Create, Edit, Delete Roles"},
		{Slug: "menus.view", Description: "View Menus"},
		{Slug: "menus.manage", Description: "Create, Edit, Delete Menus"},
		{Slug: "audit_logs.view", Description: "View Audit Logs"},
	}

	for _, p := range permissions {
		var perm models.Permission
		if err := DB.Where(models.Permission{Slug: p.Slug}).FirstOrCreate(&perm).Error; err != nil {
			log.Printf("Error finding/creating permission %s: %v", p.Slug, err)
			continue
		}
		if err := DB.Model(&perm).Updates(p).Error; err != nil {
			log.Printf("Error updating permission %s: %v", p.Slug, err)
		}
	}

	// 2. Create Roles
	roles := []models.Role{
		{Name: "Super Admin", Description: "Full Access"},
		{Name: "User", Description: "Standard User Access"},
	}

	for _, r := range roles {
		var role models.Role
		if err := DB.Where(models.Role{Name: r.Name}).FirstOrCreate(&role).Error; err != nil {
			log.Printf("Error finding/creating role %s: %v", r.Name, err)
			continue
		}
		if err := DB.Model(&role).Updates(r).Error; err != nil {
			log.Printf("Error updating role %s: %v", r.Name, err)
		}
	}

	// 3. Assign Permissions to Roles
	// Super Admin gets ALL permissions
	var superAdmin models.Role
	if err := DB.Where("name = ?", "Super Admin").First(&superAdmin).Error; err == nil {
		var allPerms []models.Permission
		DB.Find(&allPerms)
		DB.Model(&superAdmin).Association("Permissions").Replace(allPerms)
	}

	// User gets limited permissions (e.g. just dashboard)
	var userRole models.Role
	if err := DB.Where("name = ?", "User").First(&userRole).Error; err == nil {
		var userPerms []models.Permission
		DB.Where("slug IN ?", []string{"dashboard.view"}).Find(&userPerms)
		DB.Model(&userRole).Association("Permissions").Replace(userPerms)
	}

	// 4. Seed Menus
	menus := []models.Menu{
		{Path: "/admin", Title: "Dashboard", Icon: "LayoutDashboard", PermissionSlug: "dashboard.view", Order: 1},
		{Path: "/admin/users", Title: "Users", Icon: "User", PermissionSlug: "users.view", Order: 2},
		{Path: "/admin/employees", Title: "Employees", Icon: "Briefcase", PermissionSlug: "users.manage", Order: 3}, // HR/Admin only
		{Path: "/admin/roles", Title: "Roles", Icon: "Shield", PermissionSlug: "roles.view", Order: 4},
		{Path: "/admin/menus", Title: "Menus", Icon: "List", PermissionSlug: "menus.view", Order: 5},
		{Path: "/admin/attendance", Title: "Attendance", Icon: "Clock", PermissionSlug: "dashboard.view", Order: 6}, // Everyone can check in
		{Path: "/admin/leaves", Title: "Leaves", Icon: "Calendar", PermissionSlug: "dashboard.view", Order: 7},      // Everyone can request leave
		{Path: "/admin/audit-logs", Title: "Audit Logs", Icon: "FileText", PermissionSlug: "audit_logs.view", Order: 8},
		{Path: "/admin/profile", Title: "My Profile", Icon: "User", PermissionSlug: "", Order: 99},
	}

	for _, m := range menus {
		var menu models.Menu
		if err := DB.Where(models.Menu{Path: m.Path}).FirstOrCreate(&menu).Error; err != nil {
			log.Printf("Error finding/creating menu %s: %v", m.Path, err)
			continue
		}
		if err := DB.Model(&menu).Updates(m).Error; err != nil {
			log.Printf("Error updating menu %s: %v", m.Path, err)
		}
	}

	// 5. Seed Admin Employee
	var adminUser models.User
	if err := DB.Where("username = ?", "admin").First(&adminUser).Error; err == nil {
		var existingEmp models.Employee
		if err := DB.Where("user_id = ?", adminUser.ID).First(&existingEmp).Error; err != nil {
			// Create dummy employee for admin
			adminEmp := models.Employee{
				UserID:     adminUser.ID,
				Position:   "SVP Code",
				Department: "IT",
				StartDate:  time.Now(),
				Status:     models.EmployeeStatusActive,
				Salary:     999999,
			}
			DB.Create(&adminEmp)
			log.Println("Seeded Admin Employee record")
		}
	}
}
