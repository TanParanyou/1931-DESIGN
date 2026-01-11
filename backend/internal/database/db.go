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
		&models.Setting{},                        // Settings
		&models.Category{},                       // Categories
		&models.Department{}, &models.Position{}, // HR Master Data
		&models.PasswordReset{}, // Password Reset Tokens
		// Business Profile System
		&models.Business{}, &models.BusinessContact{}, &models.BusinessHour{},
		&models.ServiceCategory{}, &models.Service{}, &models.Gallery{}, &models.PageConfig{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	log.Println("Database migration completed")

	// Seed RBAC Data
	seedRBAC()
	// Seed Settings
	seedSettings()
	// Seed Categories
	seedCategories()
}

func seedSettings() {
	settings := []models.Setting{
		// General
		{Key: "site_title", Value: "1931 Design", Description: "The main title of the website", Group: "general", IsPublic: true},
		{Key: "site_tagline_th", Value: "สตูดิโอออกแบบสถาปัตยกรรมและสเปซ", Description: "Tagline (Thai)", Group: "general", IsPublic: true},
		{Key: "site_tagline_en", Value: "Architectural & Space Design Studio", Description: "Tagline (English)", Group: "general", IsPublic: true},
		{Key: "maintenance_mode", Value: "false", Description: "Turn on maintenance mode", Type: "boolean", Group: "general", IsPublic: true},

		// SEO
		{Key: "site_description", Value: "1931 Co., Ltd. is a premier architectural design studio based in Thailand.", Description: "Meta description for SEO", Type: "textarea", Group: "seo", IsPublic: true},
		{Key: "seo_keywords", Value: "Architecture, Design, Interior Design, Thailand, Bangkok, Sustainable Design", Description: "Comma-separated keywords", Type: "textarea", Group: "seo", IsPublic: true},
		{Key: "google_verification", Value: "", Description: "Google Search Console Verification Code", Group: "seo", IsPublic: true},
		{Key: "facebook_verification", Value: "", Description: "Facebook Domain Verification Code", Group: "seo", IsPublic: true},

		// Contact
		{Key: "contact_email", Value: "info@1931.co.th", Description: "Contact email", Group: "contact", IsPublic: true},
		{Key: "contact_phone", Value: "+66-92-518-9280", Description: "Contact phone number", Group: "contact", IsPublic: true},
		{Key: "contact_address_th", Value: "160/78 หมู่ 5 ถนนบางกรวย-ไทรน้อย ต.บางกรวย อ.บางกรวย จ.นนทบุรี 11130", Description: "Address (Thai)", Type: "textarea", Group: "contact", IsPublic: true},
		{Key: "contact_address_en", Value: "160/78 Moo 5, Bang Kruai-Sai Noi Rd., Bang Kruai, Nonthaburi 11130", Description: "Address (English)", Type: "textarea", Group: "contact", IsPublic: true},
		{Key: "google_map_url", Value: "", Description: "Google Maps Link", Group: "contact", IsPublic: true},

		// Business
		{Key: "business_legal_name", Value: "บริษัท 1931 จำกัด", Description: "Registered Legal Name", Group: "business", IsPublic: true},
		{Key: "business_tax_id", Value: "", Description: "Tax Identification Number", Group: "business", IsPublic: true},

		// Social
		{Key: "social_facebook", Value: "https://facebook.com/1931", Description: "Facebook URL", Group: "social", IsPublic: true},
		{Key: "social_instagram", Value: "https://instagram.com/1931_studio", Description: "Instagram URL", Group: "social", IsPublic: true},
		{Key: "social_line", Value: "", Description: "Line Official Account URL", Group: "social", IsPublic: true},
		{Key: "social_twitter", Value: "https://twitter.com/1931design", Description: "Twitter/X URL", Group: "social", IsPublic: true},
		{Key: "social_github", Value: "https://github.com/1931design", Description: "Github URL", Group: "social", IsPublic: true},
		{Key: "social_behance", Value: "", Description: "Behance URL", Group: "social", IsPublic: true},
		{Key: "social_pinterest", Value: "", Description: "Pinterest URL", Group: "social", IsPublic: true},

		// Analytics / Integrations
		{Key: "analytics_google_id", Value: "", Description: "Google Analytics ID (G-XXXXXXXX)", Group: "analytics", IsPublic: true},
		{Key: "analytics_gtm_id", Value: "", Description: "Google Tag Manager ID (GTM-XXXXXX)", Group: "analytics", IsPublic: true},
		{Key: "analytics_pixel_id", Value: "", Description: "Meta Pixel ID", Group: "analytics", IsPublic: true},
	}

	for _, s := range settings {
		var setting models.Setting
		// If key doesn't exist, create it.
		// We avoid updating existing settings to not overwrite user changes.
		if err := DB.Where("key = ?", s.Key).First(&setting).Error; err != nil {
			DB.Create(&s)
			log.Printf("Seeded setting: %s", s.Key)
		}
	}
}

func seedRBAC() {
	// 1. Create Permissions
	permissions := []models.Permission{
		{Slug: "admin.access", Description: "Access Admin Panel"},
		{Slug: "dashboard.view", Description: "View Dashboard"},
		{Slug: "users.view", Description: "View Users"},
		{Slug: "users.manage", Description: "Create, Edit, Delete Users"},
		{Slug: "roles.view", Description: "View Roles"},
		{Slug: "roles.manage", Description: "Create, Edit, Delete Roles"},
		{Slug: "menus.view", Description: "View Menus"},
		{Slug: "menus.manage", Description: "Create, Edit, Delete Menus"},
		{Slug: "settings.view", Description: "View Settings"},
		{Slug: "settings.manage", Description: "Manage Settings"},
		{Slug: "audit_logs.view", Description: "View Audit Logs"},
		{Slug: "projects.view", Description: "View Projects"},
		{Slug: "projects.manage", Description: "Create, Edit, Delete Projects"},
		{Slug: "categories.view", Description: "View Categories"},
		{Slug: "categories.manage", Description: "Create, Edit, Delete Categories"},
		{Slug: "attendance.view", Description: "View Attendance"},
		{Slug: "attendance.manage", Description: "Manage Attendance"},
		{Slug: "leaves.view", Description: "View Leaves"},
		{Slug: "leaves.manage", Description: "Manage Leave Requests"},
		{Slug: "businesses.view", Description: "View Business Profiles"},
		{Slug: "businesses.manage", Description: "Create, Edit, Delete Business Profiles"},
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
	// Super Admin gets ALL permissions (รันทุกครั้งเพื่อให้ได้ permissions ใหม่)
	var superAdmin models.Role
	if err := DB.Where("name = ?", "Super Admin").First(&superAdmin).Error; err == nil {
		var allPerms []models.Permission
		DB.Find(&allPerms)
		if err := DB.Model(&superAdmin).Association("Permissions").Replace(allPerms); err != nil {
			log.Printf("Error assigning permissions to Super Admin: %v", err)
		} else {
			log.Printf("Assigned %d permissions to Super Admin role", len(allPerms))
		}
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
		{Path: "/admin/employees", Title: "Employees", Icon: "Briefcase", PermissionSlug: "users.manage", Order: 3},
		{Path: "/admin/hr/departments", Title: "Departments", Icon: "Building", PermissionSlug: "users.manage", Order: 4},
		{Path: "/admin/hr/positions", Title: "Positions", Icon: "BadgeCheck", PermissionSlug: "users.manage", Order: 5},
		{Path: "/admin/projects", Title: "Projects", Icon: "FolderKanban", PermissionSlug: "projects.view", Order: 6},
		{Path: "/admin/categories", Title: "Categories", Icon: "Tags", PermissionSlug: "categories.view", Order: 7},
		{Path: "/admin/roles", Title: "Roles", Icon: "Shield", PermissionSlug: "roles.view", Order: 8},
		{Path: "/admin/menus", Title: "Menus", Icon: "List", PermissionSlug: "menus.view", Order: 9},
		{Path: "/admin/settings", Title: "Settings", Icon: "Settings", PermissionSlug: "settings.view", Order: 90},
		{Path: "/admin/attendance", Title: "Attendance", Icon: "Clock", PermissionSlug: "attendance.view", Order: 10},
		{Path: "/admin/leaves", Title: "Leaves", Icon: "Calendar", PermissionSlug: "leaves.view", Order: 11},
		{Path: "/admin/audit-logs", Title: "Audit Logs", Icon: "FileText", PermissionSlug: "audit_logs.view", Order: 12},
		{Path: "/admin/businesses", Title: "Business Profiles", Icon: "Store", PermissionSlug: "businesses.view", Order: 13},
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

func seedCategories() {
	categories := []models.Category{
		{Name: "Architecture", Slug: "architecture", SortOrder: 1, IsActive: true},
		{Name: "Interior", Slug: "interior", SortOrder: 2, IsActive: true},
		{Name: "Built-in", Slug: "built-in", SortOrder: 3, IsActive: true},
		{Name: "Renovate", Slug: "renovate", SortOrder: 4, IsActive: true},
		{Name: "Landscape", Slug: "landscape", SortOrder: 5, IsActive: true},
		{Name: "Construction", Slug: "construction", SortOrder: 6, IsActive: true},
	}

	for _, c := range categories {
		var cat models.Category
		if err := DB.Where("slug = ?", c.Slug).First(&cat).Error; err != nil {
			DB.Create(&c)
			log.Printf("Seeded category: %s", c.Name)
		}
	}
}
