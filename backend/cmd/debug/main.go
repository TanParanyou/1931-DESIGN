package main

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("Warning: No .env file found")
	}

	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		log.Fatal("DB_URL not set")
	}

	if !strings.Contains(dsn, "default_query_exec_mode") {
		if strings.Contains(dsn, "?") {
			dsn += "&default_query_exec_mode=simple_protocol"
		} else {
			dsn += "?default_query_exec_mode=simple_protocol"
		}
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: false,
	})
	if err != nil {
		log.Fatal(err)
	}

	var tables []struct {
		TableSchema string
		TableName   string
	}

	result := db.Raw("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')").Scan(&tables)
	if result.Error != nil {
		log.Fatal(result.Error)
	}

	log.Println("Existing tables:")
	for _, t := range tables {
		log.Printf("- Schema: %s, Table: %s\n", t.TableSchema, t.TableName)
	}
}
