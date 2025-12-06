package main

import (
	"log"
	"os"

	"backend/internal/database"
	"backend/internal/models"

	"github.com/joho/godotenv"
)

func main() {
	// Load env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, checking system env")
	} else {
		log.Println("Loaded .env")
	}

	// Set DB_URL if missing (try to guess or warn)
	if os.Getenv("DB_URL") == "" {
		log.Fatal("DB_URL is not set")
	}

	// Connect to DB (this creates tables & seeds RBAC automatically via seedRBAC in db.go)
	database.ConnectDB()

	// Additional Logic: Promote specific user to Super Admin
	// Try to find "admin" or whichever user we want
	username := "admin" // Hardcoded for now, or use args
	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		log.Printf("User '%s' not found. Please create this user first or update the script.\n", username)
	} else {
		// Find Super Admin Role
		var superAdminRole models.Role
		if err := database.DB.Where("name = ?", "Super Admin").First(&superAdminRole).Error; err != nil {
			log.Fatal("Super Admin role not found!")
		}

		// Assign Role
		user.RoleID = &superAdminRole.ID
		// We don't save Role string anymore, but let's be safe if old logic persists anywhere
		// Actually, backend now uses RoleID mainly.
		if err := database.DB.Save(&user).Error; err != nil {
			log.Printf("Failed to update user '%s': %v\n", username, err)
		} else {
			log.Printf("User '%s' successfully promoted to Super Admin (Role ID: %d)\n", username, superAdminRole.ID)
		}
	}

	log.Println("Seed complete.")
}
