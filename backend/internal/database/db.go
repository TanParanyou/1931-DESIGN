package database

import (
	"log"
	"os"
	"strings"

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
	err = DB.AutoMigrate(&models.News{}, &models.Career{}, &models.Contact{}, &models.Project{}, &models.User{})
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	log.Println("Database migration completed")
}
