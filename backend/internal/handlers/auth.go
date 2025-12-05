package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
	"errors"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type LoginInput struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type RegisterInput struct {
	Username  string `json:"username" validate:"required"`
	Password  string `json:"password" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func Login(c *fiber.Ctx) error {
	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	var user models.User
	if err := database.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("invalid username or password"))
	}

	if !user.Active {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("user is inactive"))
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("invalid username or password"))
	}

	accessToken, refreshToken, err := utils.GenerateTokens(user.ID, user.Username)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not generate tokens"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"token":         accessToken,
		"refresh_token": refreshToken,
		"user": fiber.Map{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"role":       user.Role,
		},
	}, "Login successful")
}

func Register(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	// Check if user exists (username or email)
	var existingUser models.User
	if err := database.DB.Where("username = ? OR email = ?", input.Username, input.Email).First(&existingUser).Error; err == nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("username or email already exists"))
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not hash password"))
	}

	user := models.User{
		Username:  input.Username,
		Password:  string(hashedPassword),
		Email:     input.Email,
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Role:      "user", // Default role
		Active:    true,   // Default active
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create user"))
	}

	return utils.SendCreated(c, fiber.Map{
		"message": "User created successfully",
		"user": fiber.Map{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"role":       user.Role,
		},
	}, "User created successfully")
}

type RefreshTokenInput struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

func RefreshToken(c *fiber.Ctx) error {
	var input RefreshTokenInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	claims, err := utils.ParseToken(input.RefreshToken)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("invalid or expired refresh token"))
	}

	// Verify user still exists and is active
	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("user not found"))
	}

	if !user.Active {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("user is inactive"))
	}

	// Generate new tokens
	accessToken, newRefreshToken, err := utils.GenerateTokens(user.ID, user.Username)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not generate tokens"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"token":         accessToken,
		"refresh_token": newRefreshToken,
	}, "Token refreshed successfully")
}
