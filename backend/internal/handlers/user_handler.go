package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
	"errors"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type UpdateProfileInput struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	LineID    string `json:"line_id"`
	Info      string `json:"info"`
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user profile
// @Tags User
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /auth/profile [get]
func GetProfile(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("unauthorized"))
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	return utils.SendSuccess(c, fiber.Map{
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
	}, "Profile retrieved successfully")
}

// UpdateProfile godoc
// @Summary Update user profile
// @Description Update current user profile
// @Tags User
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param input body UpdateProfileInput true "Profile info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /auth/profile [put]
func UpdateProfile(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("unauthorized"))
	}

	var input UpdateProfileInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	// Update fields
	user.FirstName = input.FirstName
	user.LastName = input.LastName
	user.Phone = input.Phone
	user.Address = input.Address
	user.LineID = input.LineID
	user.Info = input.Info

	if err := database.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not update profile"))
	}

	return utils.SendSuccess(c, fiber.Map{
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
	}, "Profile updated successfully")
}

// GetAllUsers godoc
// @Summary Get all users
// @Description Get a list of all users (Admin only)
// @Tags Admin
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/users [get]
func GetAllUsers(c *fiber.Ctx) error {
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not fetch users"))
	}

	// Sanitize users (remove password) is handled by JSON tag "-" in model, but let's be safe or just return strict struct
	// The model already has JSON tag "-" for password, so it's safe.

	return utils.SendSuccess(c, fiber.Map{
		"users": users,
	}, "Users retrieved successfully")
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Get a user by ID (Admin only)
// @Tags Admin
// @Security ApiKeyAuth
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/users/{id} [get]
func GetUserByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"user": user,
	}, "User retrieved successfully")
}

type CreateUserInput struct {
	Username  string `json:"username" validate:"required"`
	Password  string `json:"password" validate:"required,min=6"`
	Email     string `json:"email" validate:"required,email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role" validate:"required"`
	Active    bool   `json:"active"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	LineID    string `json:"line_id"`
	Info      string `json:"info"`
}

// CreateUser godoc
// @Summary Create a new user
// @Description Create a new user (Admin only)
// @Tags Admin
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param input body CreateUserInput true "User info"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/users [post]
func CreateUser(c *fiber.Ctx) error {
	var input CreateUserInput
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
		Role:      input.Role,
		Active:    input.Active,
		Phone:     input.Phone,
		Address:   input.Address,
		LineID:    input.LineID,
		Info:      input.Info,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create user"))
	}

	return utils.SendCreated(c, fiber.Map{
		"user": user,
	}, "User created successfully")
}

type UpdateUserAdminInput struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
	Active    bool   `json:"active"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	LineID    string `json:"line_id"`
	Info      string `json:"info"`
}

// UpdateUserAdmin godoc
// @Summary Update a user
// @Description Update a user (Admin only)
// @Tags Admin
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param input body UpdateUserAdminInput true "User info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/users/{id} [put]
func UpdateUserAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	var input UpdateUserAdminInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	user.FirstName = input.FirstName
	user.LastName = input.LastName
	user.Role = input.Role
	user.Active = input.Active
	user.Phone = input.Phone
	user.Address = input.Address
	user.LineID = input.LineID
	user.Info = input.Info

	if err := database.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not update user"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"user": user,
	}, "User updated successfully")
}

// DeleteUser godoc
// @Summary Delete a user
// @Description Delete a user (Admin only)
// @Tags Admin
// @Security ApiKeyAuth
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/users/{id} [delete]
func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User // Fetch the user first to ensure it exists
	if err := database.DB.First(&user, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	// Delete user
	if err := database.DB.Delete(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to delete user"))
	}

	return utils.SendSuccess(c, nil, "User deleted successfully")
}

// AdminResetPassword allows admins to reset a user's password
type ResetPasswordInput struct {
	NewPassword string `json:"new_password"`
}

// AdminResetPassword godoc
// @Summary Reset user password
// @Description Reset a user's password (Admin only)
// @Tags Admin
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param input body ResetPasswordInput true "New password"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/users/{id}/reset-password [put]
func AdminResetPassword(c *fiber.Ctx) error {
	id := c.Params("id")
	var input ResetPasswordInput

	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	if len(input.NewPassword) < 6 {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("password must be at least 6 characters"))
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to hash password"))
	}

	user.Password = string(hashedPassword)
	if err := database.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to update password"))
	}

	return utils.SendSuccess(c, nil, "Password reset successfully")
}
