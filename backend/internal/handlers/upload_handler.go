package handlers

import (
	"backend/internal/services"
	"errors"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
)

var r2Service *services.R2Service

// InitR2Service initializes the R2 service
func InitR2Service() error {
	var err error
	r2Service, err = services.NewR2Service()
	return err
}

// GetR2Service returns the R2 service instance
func GetR2Service() *services.R2Service {
	return r2Service
}

// Allowed image extensions
var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

// Max file size (10MB)
const maxFileSize = 10 * 1024 * 1024

// UploadImage handles image upload to R2
// UploadImage godoc
// @Summary Upload an image
// @Description Upload an image to Cloudflare R2
// @Tags Upload
// @Accept multipart/form-data
// @Produce json
// @Param image formance file true "Image file"
// @Param folder formData string false "Folder name" default(projects)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/upload/image [post]
func UploadImage(c *fiber.Ctx) error {
	if r2Service == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Upload service not configured",
		})
	}

	// Get file from form
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "No image file provided",
		})
	}

	// Check file size
	if file.Size > maxFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File size exceeds 10MB limit",
		})
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExtensions[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid file type. Allowed: jpg, jpeg, png, gif, webp",
		})
	}

	// Get folder from form (default: projects)
	folder := c.FormValue("folder", "projects")

	// Open file
	f, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to open file",
		})
	}
	defer f.Close()

	// Upload to R2
	result, err := r2Service.UploadImage(f, file.Filename, folder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to upload image: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Image uploaded successfully",
		"data":    result,
	})
}

// DeleteImage handles image deletion from R2
// DeleteImage godoc
// @Summary Delete an image
// @Description Delete an image from Cloudflare R2
// @Tags Upload
// @Produce json
// @Param key path string true "Image key"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/upload/image/{key} [delete]
func DeleteImage(c *fiber.Ctx) error {
	if r2Service == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Upload service not configured",
		})
	}

	key := c.Params("*")
	if key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Image key is required",
		})
	}

	if err := r2Service.DeleteImage(key); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete image: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Image deleted successfully",
	})
}

// DeleteImages handles multiple image deletion from R2
func DeleteImages(keys []string) error {
	if r2Service == nil {
		return errors.New("upload service not configured")
	}
	return r2Service.DeleteImages(keys)
}
