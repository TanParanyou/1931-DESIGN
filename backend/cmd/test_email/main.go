package main

import (
	"backend/config"
	"backend/pkg/email"
	"fmt"
	"os"
	"strings"
)

func main() {
	// Load configuration
	config.LoadConfig()

	fmt.Println("--- Email Configuration Test ---")

	host := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	port := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	user := strings.TrimSpace(os.Getenv("SMTP_USER"))
	// pass := os.Getenv("SMTP_PASSWORD")
	from := strings.TrimSpace(os.Getenv("SMTP_FROM_EMAIL"))

	fmt.Printf("SMTP Host: %q\n", host)
	fmt.Printf("SMTP Port: %q\n", port)
	fmt.Printf("SMTP User: %q\n", user)
	fmt.Printf("SMTP From: %q\n", from)

	if host == "" {
		fmt.Println("Error: SMTP_HOST is empty")
		return
	}

	// Try sending
	fmt.Println("\nAttempting to send test email...")
	toEmail := user
	if toEmail == "" {
		// If user config is broken, this might also be broken, but let's try
		toEmail = "test@example.com"
	}

	err := email.SendEmail([]string{toEmail}, "Test Email from 1931-DESIGN", "Test body")
	if err != nil {
		fmt.Printf("\nFAILED to send email: %v\n", err)
	} else {
		fmt.Printf("\nSUCCESS! Email sent to %s\n", toEmail)
	}
}
