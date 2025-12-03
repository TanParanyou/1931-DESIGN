package handlers

import (
	"backend/internal/services"
	"backend/pkg/utils"
	"errors"

	"github.com/gofiber/fiber/v2"
)

func GetCareers(c *fiber.Ctx) error {
	careers, err := services.GetCareers()
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err)
	}
	return utils.SendSuccess(c, careers, "Successfully fetched careers")
}

func GetCareerByID(c *fiber.Ctx) error {
	id := c.Params("id")
	career, err := services.GetCareerByID(id)
	if err != nil {
		if errors.Is(err, utils.ErrNotFound) {
			return utils.SendError(c, fiber.StatusNotFound, err)
		}
		return utils.SendError(c, fiber.StatusInternalServerError, err)
	}
	return utils.SendSuccess(c, career, "Successfully fetched career detail")
}
