package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/services"
	"backend/pkg/email"
	"backend/pkg/utils"
	"errors"
	"fmt"
	"time"

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
	if err := database.DB.Preload("Role.Permissions").Where("username = ?", input.Username).First(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("invalid username or password"))
	}

	if !user.Active {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("user is inactive"))
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("invalid username or password"))
	}

	// Store previous login time before updating
	previousLastLogin := user.LastLogin

	// Update last login time
	now := time.Now()
	user.LastLogin = &now
	database.DB.Save(&user)

	// Flatten permissions
	permissions := []string{}
	if user.RoleID != nil {
		for _, p := range user.Role.Permissions {
			permissions = append(permissions, p.Slug)
		}
	}

	accessToken, refreshToken, err := utils.GenerateTokens(user.ID, user.Username)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not generate tokens"))
	}

	// Send login notification email (async)
	go func() {
		if err := email.SendLoginNotification(user.Email, user.Username); err != nil {
			// Log error but don't fail the request
			// In a real app, use a proper logger
			fmt.Printf("Failed to send login email: %v\n", err)
		} else {
			fmt.Println("Login email sent successfully")
		}
	}()

	// Audit Log
	services.CreateAuditLog(c, "USER_LOGIN", user.ID, "user", map[string]string{"username": user.Username}, user.ID)

	return utils.SendSuccess(c, fiber.Map{
		"token":         accessToken,
		"refresh_token": refreshToken,
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
			"last_login":  previousLastLogin,
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

	// Default Role (User)
	var role models.Role
	// Try to find the user role
	if err := database.DB.Where("name = ?", "user").First(&role).Error; err != nil {
		// If role doesn't exist, we might want to handle it or let it run without role
	}

	user := models.User{
		Username:  input.Username,
		Password:  string(hashedPassword),
		Email:     input.Email,
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Active:    true,
		Phone:     input.Phone,
		Address:   input.Address,
		LineID:    input.LineID,
		Info:      input.Info,
	}

	// Only assign role if found
	if role.ID != 0 {
		user.RoleID = &role.ID
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create user"))
	}

	return utils.SendCreated(c, fiber.Map{
		"message": "User created successfully",
		"user": fiber.Map{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"first_name":  user.FirstName,
			"last_name":   user.LastName,
			"role":        role.Name,
			"phone":       user.Phone,
			"address":     user.Address,
			"line_id":     user.LineID,
			"info":        user.Info,
			"permissions": []string{},
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
// @Description Change user password with strength validation
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

	// Validate password strength
	strengthResult := utils.ValidatePasswordStrength(input.NewPassword)
	if !strengthResult.IsValid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message":  "Password does not meet strength requirements",
				"messages": strengthResult.Messages,
			},
		})
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

// ============== PIN Handlers ==============

type SetPinInput struct {
	PIN      string `json:"pin" validate:"required"`
	Password string `json:"password" validate:"required"` // ยืนยันตัวตนก่อนตั้ง PIN
}

// SetPin godoc
// @Summary Set or update PIN
// @Description Set or update user PIN for quick login
// @Tags Auth
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param input body SetPinInput true "PIN setup info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/pin [put]
func SetPin(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, err)
	}

	var input SetPinInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	// Validate PIN format
	valid, msg := utils.ValidatePIN(input.PIN)
	if !valid {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New(msg))
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	// Verify password before allowing PIN setup
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("incorrect password"))
	}

	// Hash PIN
	hashedPIN, err := bcrypt.GenerateFromPassword([]byte(input.PIN), bcrypt.DefaultCost)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to hash PIN"))
	}

	user.PIN = string(hashedPIN)
	user.PINEnabled = true
	if err := database.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to save PIN"))
	}

	services.CreateAuditLog(c, "PIN_SET", user.ID, "user", nil, user.ID)

	return utils.SendSuccess(c, nil, "PIN set successfully")
}

// DisablePin godoc
// @Summary Disable PIN login
// @Description Disable PIN for this account
// @Tags Auth
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/pin [delete]
func DisablePin(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, err)
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	user.PIN = ""
	user.PINEnabled = false
	if err := database.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to disable PIN"))
	}

	services.CreateAuditLog(c, "PIN_DISABLED", user.ID, "user", nil, user.ID)

	return utils.SendSuccess(c, nil, "PIN disabled successfully")
}

type LoginWithPinInput struct {
	Username string `json:"username" validate:"required"`
	PIN      string `json:"pin" validate:"required"`
}

// LoginWithPin godoc
// @Summary Login with PIN
// @Description Login using username and PIN
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body LoginWithPinInput true "Login credentials"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/login-pin [post]
func LoginWithPin(c *fiber.Ctx) error {
	var input LoginWithPinInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	var user models.User
	if err := database.DB.Preload("Role.Permissions").Where("username = ?", input.Username).First(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("invalid username or PIN"))
	}

	if !user.Active {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("user is inactive"))
	}

	if !user.PINEnabled || user.PIN == "" {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("PIN login is not enabled for this account"))
	}

	// Verify PIN
	if err := bcrypt.CompareHashAndPassword([]byte(user.PIN), []byte(input.PIN)); err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, errors.New("invalid username or PIN"))
	}

	// Store previous login time before updating
	previousLastLogin := user.LastLogin

	// Update last login time
	now := time.Now()
	user.LastLogin = &now
	database.DB.Save(&user)

	// Flatten permissions
	permissions := []string{}
	if user.RoleID != nil {
		for _, p := range user.Role.Permissions {
			permissions = append(permissions, p.Slug)
		}
	}

	accessToken, refreshToken, err := utils.GenerateTokens(user.ID, user.Username)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not generate tokens"))
	}

	// Send login notification email (async)
	go func() {
		if err := email.SendLoginNotification(user.Email, user.Username); err != nil {
			fmt.Printf("Failed to send login email: %v\n", err)
		}
	}()

	// Audit Log
	services.CreateAuditLog(c, "USER_LOGIN_PIN", user.ID, "user", map[string]string{"username": user.Username}, user.ID)

	return utils.SendSuccess(c, fiber.Map{
		"token":         accessToken,
		"refresh_token": refreshToken,
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
			"pin_enabled": user.PINEnabled,
			"last_login":  previousLastLogin,
		},
	}, "Login successful")
}

// ============== Forgot Password Handlers ==============

type ForgotPasswordInput struct {
	Email string `json:"email" validate:"required,email"`
}

// ForgotPassword godoc
// @Summary Request password reset
// @Description Send password reset email
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body ForgotPasswordInput true "Email"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/forgot-password [post]
func ForgotPassword(c *fiber.Ctx) error {
	var input ForgotPasswordInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// Don't reveal if email exists or not (security)
		return utils.SendSuccess(c, nil, "If your email is registered, you will receive a password reset link")
	}

	// Generate reset token
	token, err := utils.GenerateResetToken()
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not generate reset token"))
	}

	// Save reset token to database
	resetRecord := models.PasswordReset{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour), // 1 hour expiry
		Used:      false,
	}

	// Delete any existing unused tokens for this user
	database.DB.Where("user_id = ? AND used = ?", user.ID, false).Delete(&models.PasswordReset{})

	if err := database.DB.Create(&resetRecord).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create reset token"))
	}

	// Build reset link (frontend URL)
	frontendURL := "http://localhost:3000" // Default
	if envURL := c.Get("Origin"); envURL != "" {
		frontendURL = envURL
	}
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, token)

	// Send email (async)
	go func() {
		if err := email.SendPasswordResetEmail(user.Email, user.Username, resetLink); err != nil {
			fmt.Printf("Failed to send reset email: %v\n", err)
		} else {
			fmt.Println("Reset email sent successfully to:", user.Email)
		}
	}()

	return utils.SendSuccess(c, nil, "If your email is registered, you will receive a password reset link")
}

// VerifyResetToken godoc
// @Summary Verify reset password token
// @Description Check if a reset token is valid
// @Tags Auth
// @Accept json
// @Produce json
// @Param token path string true "Reset Token"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/verify-reset-token/{token} [get]
func VerifyResetToken(c *fiber.Ctx) error {
	token := c.Params("token")
	if token == "" {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("token is required"))
	}

	var resetRecord models.PasswordReset
	if err := database.DB.Where("token = ? AND used = ? AND expires_at > ?", token, false, time.Now()).First(&resetRecord).Error; err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid or expired token"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"valid": true,
	}, "Token is valid")
}

type ResetPasswordWithTokenInput struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required"`
}

// ResetPassword godoc
// @Summary Reset password with token
// @Description Reset password using the token from email
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body ResetPasswordWithTokenInput true "Reset info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/reset-password [post]
func ResetPassword(c *fiber.Ctx) error {
	var input ResetPasswordWithTokenInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	// Find valid reset token
	var resetRecord models.PasswordReset
	if err := database.DB.Where("token = ? AND used = ? AND expires_at > ?", input.Token, false, time.Now()).First(&resetRecord).Error; err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid or expired token"))
	}

	// Validate password strength
	strengthResult := utils.ValidatePasswordStrength(input.NewPassword)
	if !strengthResult.IsValid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"message":  "Password does not meet strength requirements",
				"messages": strengthResult.Messages,
			},
		})
	}

	// Find user
	var user models.User
	if err := database.DB.First(&user, resetRecord.UserID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to hash password"))
	}

	// Update user password
	user.Password = string(hashedPassword)
	if err := database.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("failed to update password"))
	}

	// Mark token as used
	resetRecord.Used = true
	database.DB.Save(&resetRecord)

	// Audit Log
	services.CreateAuditLog(c, "PASSWORD_RESET", user.ID, "user", nil, user.ID)

	return utils.SendSuccess(c, nil, "Password reset successfully. You can now login with your new password.")
}

// GetPinStatus godoc
// @Summary Get PIN status
// @Description Check if user has PIN enabled
// @Tags Auth
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /auth/pin-status [get]
func GetPinStatus(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, err)
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("user not found"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"pin_enabled": user.PINEnabled,
	}, "PIN status retrieved")
}
