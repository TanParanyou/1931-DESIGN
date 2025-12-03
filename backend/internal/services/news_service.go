package services

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
	"errors"

	"gorm.io/gorm"
)

func GetNews() ([]models.News, error) {
	var news []models.News
	result := database.DB.Find(&news)
	if result.Error != nil {
		return nil, utils.ErrInternalServer
	}
	return news, nil
}

func GetNewsByID(id string) (models.News, error) {
	var news models.News
	result := database.DB.First(&news, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return news, utils.ErrNotFound
		}
		return news, utils.ErrInternalServer
	}
	return news, nil
}
