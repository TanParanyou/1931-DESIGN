package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/services"
	"backend/pkg/utils"
	"errors"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// Helper function to get role ID by name (temporary until frontend sends ID)
func getRoleIDByName(name string) uint {
	var role models.Role
	if err := database.DB.Where("name = ?", name).First(&role).Error; err != nil {
		return 0 // Handle appropriately or use default
	}
	return role.ID
}

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
	if err := database.DB.Preload("Role.Permissions").First(&user, userID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	// Flatten permissions
	permissions := []string{}
	for _, p := range user.Role.Permissions {
		permissions = append(permissions, p.Slug)
	}

	return utils.SendSuccess(c, fiber.Map{
		"user": fiber.Map{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"first_name":  user.FirstName,
			"last_name":   user.LastName,
			"role":        user.Role.Name,
			"phone":       user.Phone,
			"address":     user.Address,
			"line_id":     user.LineID,
			"info":        user.Info,
			"permissions": permissions,
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
			"role":       user.Role.Name,
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
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Page limit" default(10)
// @Router /api/users [get]
func GetAllUsers(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	offset := (page - 1) * limit

	var users []models.User
	var total int64

	if err := database.DB.Model(&models.User{}).Count(&total).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not count users"))
	}

	if err := database.DB.Preload("Role").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not fetch users"))
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	pagination := &utils.Pagination{
		Page:        page,
		Limit:       limit,
		TotalItems:  total,
		TotalPages:  totalPages,
		HasPrevious: page > 1,
		HasNext:     page < totalPages,
	}

	return utils.SendSuccessWithPagination(c, users, pagination, nil, "Users retrieved successfully")
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
	if err := database.DB.Preload("Role").First(&user, id).Error; err != nil {
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
	Role      string `json:"role" validate:"required"` // Accepts name like "admin", "user"
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

	// Get Role ID
	roleID := getRoleIDByName(input.Role)
	if roleID == 0 {
		// Fallback to 'user' role if not found or handle error.
		// ideally we should error if role doesn't exist, but for now lets default to 2 (User) or similar
		// Assuming 2 is User. Better: fetch 'user' role.
		roleID = getRoleIDByName("user")
	}
	roleIDPtr := &roleID

	user := models.User{
		Username:  input.Username,
		Password:  string(hashedPassword),
		Email:     input.Email,
		FirstName: input.FirstName,
		LastName:  input.LastName,
		RoleID:    roleIDPtr,
		Active:    input.Active,
		Phone:     input.Phone,
		Address:   input.Address,
		LineID:    input.LineID,
		Info:      input.Info,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create user"))
	}

	// Audit Log
	services.CreateAuditLog(c, "USER_CREATE", user.ID, "user", map[string]string{"username": user.Username, "role": input.Role})

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

	if input.Role != "" {
		roleID := getRoleIDByName(input.Role)
		if roleID != 0 {
			user.RoleID = &roleID
		}
	}

	user.Active = input.Active
	user.Phone = input.Phone
	user.Address = input.Address
	user.LineID = input.LineID
	user.Info = input.Info

	if err := database.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not update user"))
	}

	// Audit Log
	services.CreateAuditLog(c, "USER_UPDATE", user.ID, "user", map[string]interface{}{"username": user.Username, "active": user.Active})

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

	// Audit Log
	services.CreateAuditLog(c, "USER_DELETE", user.ID, "user", map[string]string{"username": user.Username})

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
