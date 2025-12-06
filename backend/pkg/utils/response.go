package utils

import (
	"net/http" // Added for http.StatusText

	"github.com/gofiber/fiber/v2"
)

type Pagination struct {
	Page        int   `json:"page"`
	Limit       int   `json:"limit"`
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
	HasPrevious bool  `json:"has_previous"`
	HasNext     bool  `json:"has_next"`
}

type SuccessResponse struct {
	Success    bool        `json:"success"`
	Data       interface{} `json:"data,omitempty"`
	Filters    interface{} `json:"filters"` // changed from omitempty to force null
	Pagination *Pagination `json:"pagination,omitempty"`
	Message    string      `json:"message,omitempty"`
}

type ErrorDetail struct {
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
	Details string `json:"details,omitempty"`
}

type ErrorResponse struct {
	Success bool        `json:"success"`
	Error   ErrorDetail `json:"error"`
}

func SendSuccess(c *fiber.Ctx, data interface{}, message string) error {
	return c.Status(fiber.StatusOK).JSON(SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func SendSuccessWithPagination(c *fiber.Ctx, data interface{}, pagination *Pagination, filters interface{}, message string) error {
	// Ensure empty filters return null
	if f, ok := filters.(fiber.Map); ok && len(f) == 0 {
		filters = nil
	} else if f, ok := filters.(map[string]interface{}); ok && len(f) == 0 {
		filters = nil
	}

	return c.Status(fiber.StatusOK).JSON(SuccessResponse{
		Success:    true,
		Data:       data,
		Pagination: pagination,
		Filters:    filters,
		Message:    message,
	})
}

func SendCreated(c *fiber.Ctx, data interface{}, message string) error {
	return c.Status(fiber.StatusCreated).JSON(SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func SendError(c *fiber.Ctx, status int, err error) error {
	return c.Status(status).JSON(ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    http.StatusText(status), // Changed from utils.StatusMessage
			Message: err.Error(),
		},
	})
}

// SendDetailedError allows sending clearer error codes and details
func SendDetailedError(c *fiber.Ctx, status int, code, message, details string) error {
	return c.Status(status).JSON(ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}
