package services

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/email"
	"backend/pkg/utils"
	"log"
)

func CreateContact(contact *models.Contact) error {
	result := database.DB.Create(contact)
	if result.Error != nil {
		return utils.ErrInternalServer
	}

	// Send Email Notification
	go func() {
		// 1. Get destination email from settings
		var setting models.Setting
		targetEmail := "ccontact.1931@gmail.com" // Default fallback

		if err := database.DB.Where("key = ?", "contact_email").First(&setting).Error; err == nil && setting.Value != "" {
			targetEmail = setting.Value
		}

		log.Printf("[Email] Attempting to send contact email to: %s (Reply-To: %s)", targetEmail, contact.Email)

		// 2. Send email
		if err := email.SendContactEmail(targetEmail, contact.Email, contact.Name, contact.Subject, contact.Message); err != nil {
			log.Printf("[Email] Failed to send contact email: %v", err)
		} else {
			log.Printf("[Email] Contact email sent successfully to %s", targetEmail)
		}
	}()

	return nil
}
