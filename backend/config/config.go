package config

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadConfig() {
	// Try loading .env from current directory
	if err := godotenv.Load(); err != nil {
		// Try loading from project root (useful when running from cmd/app)
		if err := godotenv.Load("../../.env"); err != nil {
			log.Println("No .env file found, reading from system environment variables")
		}
	}
}
