package services

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
)

func CreateContact(contact *models.Contact) error {
	result := database.DB.Create(contact)
	if result.Error != nil {
		return utils.ErrInternalServer
	}
	return nil
}
