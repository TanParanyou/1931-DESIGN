package handlers

import (
	"backend/internal/models"
	"backend/internal/services"
	"backend/pkg/utils"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

func SubmitContact(c *fiber.Ctx) error {
	var contact models.Contact
	if err := c.BodyParser(&contact); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, utils.ErrBadRequest)
	}

	validate := validator.New()
	if err := validate.Struct(contact); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, err)
	}

	if err := services.CreateContact(&contact); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err)
	}

	return utils.SendCreated(c, contact, "Contact submitted successfully")
}
