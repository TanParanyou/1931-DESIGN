package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

// GetAuditLogs godoc
// @Summary Get audit logs
// @Description Get a list of audit logs (Admin only)
// @Tags Admin
// @Security ApiKeyAuth
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Page limit" default(10)
// @Param search query string false "Search term"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/audit-logs [get]
func GetAuditLogs(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search")
	offset := (page - 1) * limit

	var logs []models.AuditLog
	var total int64

	query := database.DB.Model(&models.AuditLog{})

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Where("action ILIKE ? OR details ILIKE ? OR entity_type ILIKE ?", searchTerm, searchTerm, searchTerm)
	}

	query.Count(&total)

	err := query.Order("created_at desc").Offset(offset).Limit(limit).Find(&logs).Error
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err)
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

	filters := fiber.Map{}
	if search != "" {
		filters["search"] = search
	}

	return utils.SendSuccessWithPagination(c, logs, pagination, filters, "Audit logs retrieved successfully")
}
