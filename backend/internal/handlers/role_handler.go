package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"
	"errors"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetAllRoles godoc
// @Summary Get all roles
// @Description Get a list of all roles with their permissions
// @Tags Admin
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/roles [get]
func GetAllRoles(c *fiber.Ctx) error {
	var roles []models.Role
	if err := database.DB.Preload("Permissions").Find(&roles).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not fetch roles"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"roles": roles,
	}, "Roles retrieved successfully")
}

// GetRole godoc
// @Summary Get role by ID
// @Description Get a role by ID
// @Tags Admin
// @Security ApiKeyAuth
// @Produce json
// @Param id path string true "Role ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/roles/{id} [get]
func GetRole(c *fiber.Ctx) error {
	id := c.Params("id")
	var role models.Role
	if err := database.DB.Preload("Permissions").First(&role, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("role not found"))
	}

	return utils.SendSuccess(c, fiber.Map{
		"role": role,
	}, "Role retrieved successfully")
}

type CreateRoleInput struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
}

// CreateRole godoc
// @Summary Create a new role
// @Description Create a new role
// @Tags Admin
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param input body CreateRoleInput true "Role info"
// @Success 201 {object} map[string]interface{}
// @Router /api/roles [post]
func CreateRole(c *fiber.Ctx) error {
	var input CreateRoleInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	role := models.Role{
		Name:        input.Name,
		Description: input.Description,
	}

	if err := database.DB.Create(&role).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not create role"))
	}

	return utils.SendCreated(c, fiber.Map{
		"role": role,
	}, "Role created successfully")
}

type UpdateRoleInput struct {
	Name          string `json:"name"`
	Description   string `json:"description"`
	PermissionIDs []uint `json:"permission_ids"` // List of permission IDs to assign
}

// UpdateRole godoc
// @Summary Update role
// @Description Update role details and permissions
// @Tags Admin
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path string true "Role ID"
// @Param input body UpdateRoleInput true "Role info"
// @Success 200 {object} map[string]interface{}
// @Router /api/roles/{id} [put]
func UpdateRole(c *fiber.Ctx) error {
	id := c.Params("id")
	var input UpdateRoleInput
	if err := c.BodyParser(&input); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("invalid input"))
	}

	var role models.Role
	if err := database.DB.First(&role, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("role not found"))
	}

	// Update fields
	if input.Name != "" {
		role.Name = input.Name
	}
	role.Description = input.Description

	// Update Permissions using transaction
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&role).Error; err != nil {
			return err
		}

		if input.PermissionIDs != nil {
			// Replace permissions
			var permissions []models.Permission
			if err := tx.Find(&permissions, input.PermissionIDs).Error; err != nil {
				return err
			}
			if err := tx.Model(&role).Association("Permissions").Replace(permissions); err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not update role"))
	}

	// Reload to get permissions
	database.DB.Preload("Permissions").First(&role, role.ID)

	return utils.SendSuccess(c, fiber.Map{
		"role": role,
	}, "Role updated successfully")
}

// DeleteRole godoc
// @Summary Delete role
// @Description Delete a role
// @Tags Admin
// @Security ApiKeyAuth
// @Produce json
// @Param id path string true "Role ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/roles/{id} [delete]
func DeleteRole(c *fiber.Ctx) error {
	id := c.Params("id")
	var role models.Role
	if err := database.DB.First(&role, id).Error; err != nil {
		return utils.SendError(c, fiber.StatusNotFound, errors.New("role not found"))
	}

	// Check if role is assigned to users
	var count int64
	database.DB.Model(&models.User{}).Where("role_id = ?", role.ID).Count(&count)
	if count > 0 {
		return utils.SendError(c, fiber.StatusBadRequest, errors.New("cannot delete role assigned to users"))
	}

	if err := database.DB.Delete(&role).Error; err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, errors.New("could not delete role"))
	}

	return utils.SendSuccess(c, nil, "Role deleted successfully")
}
