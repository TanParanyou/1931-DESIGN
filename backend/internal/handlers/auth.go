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
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	LineID    string `json:"line_id"`
	Info      string `json:"info"`
}

// Login godoc
// @Summary Login user
// @Description Login with username and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body LoginInput true "Login credentials"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/login [post]
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
			"phone":      user.Phone,
			"address":    user.Address,
			"line_id":    user.LineID,
			"info":       user.Info,
		},
	}, "Login successful")
}

// Register godoc
// @Summary Register user
// @Description Register a new user
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body RegisterInput true "User registration info"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth/register [post]
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
		Phone:     input.Phone,
		Address:   input.Address,
		LineID:    input.LineID,
		Info:      input.Info,
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
			"phone":      user.Phone,
			"address":    user.Address,
			"line_id":    user.LineID,
			"info":       user.Info,
		},
	}, "User created successfully")
}

type RefreshTokenInput struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Get a new access token using refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body RefreshTokenInput true "Refresh Token"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/refresh [post]
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

type ChangePasswordInput struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// ChangePassword godoc
// @Summary Change password
// @Description Change user password
// @Tags Auth
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param input body ChangePasswordInput true "Password change info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/change-password [put]
func ChangePassword(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, err)
	}
	var input ChangePasswordInput

	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword)); err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("incorrect old password"))
	}

	if len(input.NewPassword) < 6 {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("new password must be at least 6 characters"))
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to hash password"))
	}

	user.Password = string(hashedPassword)
	if err := database.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to update password"))
	}

	return utils.SendSuccess(c, nil, "Password changed successfully")
}
