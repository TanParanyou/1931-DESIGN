package services

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
	"errors"

	"gorm.io/gorm"
)

func GetCareers() ([]models.Career, error) {
	var careers []models.Career
	result := database.DB.Find(&careers)
	if result.Error != nil {
		return nil, utils.ErrInternalServer
	}
	return careers, nil
}

func GetCareerByID(id string) (models.Career, error) {
	var career models.Career
	result := database.DB.First(&career, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return career, utils.ErrNotFound
		}
		return career, utils.ErrInternalServer
	}
	return career, nil
}
