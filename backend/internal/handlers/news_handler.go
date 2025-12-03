package handlers

import (
	"backend/internal/services"
	"backend/pkg/utils"
	"errors"

	"github.com/gofiber/fiber/v2"
)

func GetNews(c *fiber.Ctx) error {
	news, err := services.GetNews()
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err)
	}
	return utils.SendSuccess(c, news, "Successfully fetched news")
}

func GetNewsByID(c *fiber.Ctx) error {
	id := c.Params("id")
	news, err := services.GetNewsByID(id)
	if err != nil {
		if errors.Is(err, utils.ErrNotFound) {
			return utils.SendError(c, fiber.StatusNotFound, err)
		}
		return utils.SendError(c, fiber.StatusInternalServerError, err)
	}
	return utils.SendSuccess(c, news, "Successfully fetched news detail")
}
