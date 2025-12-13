package services

import (
	"bytes"
	"context"
	"fmt"
	"image"
	_ "image/gif" // Register GIF decoder
	"image/jpeg"
	_ "image/png" // Register PNG decoder
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/disintegration/imaging"
	"github.com/google/uuid"
	_ "golang.org/x/image/webp" // Register WebP decoder
)

type R2Service struct {
	client    *s3.Client
	bucket    string
	publicURL string
}

type UploadResult struct {
	Key          string `json:"key"`
	URL          string `json:"url"`
	ThumbnailKey string `json:"thumbnail_key"`
	ThumbnailURL string `json:"thumbnail_url"`
}

// Image size constants
const (
	MainMaxWidth    = 1200
	MainMaxHeight   = 900
	ThumbnailWidth  = 400
	ThumbnailHeight = 300
	JPEGQuality     = 85
)

// NewR2Service creates a new R2 service instance
func NewR2Service() (*R2Service, error) {
	accountID := os.Getenv("R2_ACCOUNT_ID")
	accessKeyID := os.Getenv("R2_ACCESS_KEY_ID")
	secretAccessKey := os.Getenv("R2_SECRET_ACCESS_KEY")
	bucketName := os.Getenv("R2_BUCKET_NAME")
	publicURL := os.Getenv("R2_PUBLIC_URL")

	if accountID == "" || accessKeyID == "" || secretAccessKey == "" || bucketName == "" {
		return nil, fmt.Errorf("R2 configuration is incomplete")
	}

	// R2 endpoint
	r2Endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)

	// Create custom resolver
	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: r2Endpoint,
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyID, secretAccessKey, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load R2 config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	return &R2Service{
		client:    client,
		bucket:    bucketName,
		publicURL: publicURL,
	}, nil
}

// UploadImage uploads an image to R2 with resizing
func (r *R2Service) UploadImage(fileData io.Reader, filename string, folder string) (*UploadResult, error) {
	// Read file data
	data, err := io.ReadAll(fileData)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Decode image
	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	// Generate unique filename
	ext := strings.ToLower(filepath.Ext(filename))
	baseName := uuid.New().String()
	timestamp := time.Now().Format("2006/01")

	// Create main image (resized)
	mainImg := imaging.Fit(img, MainMaxWidth, MainMaxHeight, imaging.Lanczos)
	mainKey := fmt.Sprintf("%s/%s/%s%s", folder, timestamp, baseName, ext)

	// Create thumbnail
	thumbImg := imaging.Fill(img, ThumbnailWidth, ThumbnailHeight, imaging.Center, imaging.Lanczos)
	thumbKey := fmt.Sprintf("%s/%s/%s_thumb%s", folder, timestamp, baseName, ext)

	// Encode and upload main image
	mainBuffer := new(bytes.Buffer)
	if err := encodeImage(mainBuffer, mainImg, ext); err != nil {
		return nil, fmt.Errorf("failed to encode main image: %w", err)
	}

	if err := r.uploadToR2(mainKey, mainBuffer.Bytes(), getContentType(ext)); err != nil {
		return nil, fmt.Errorf("failed to upload main image: %w", err)
	}

	// Encode and upload thumbnail
	thumbBuffer := new(bytes.Buffer)
	if err := encodeImage(thumbBuffer, thumbImg, ext); err != nil {
		return nil, fmt.Errorf("failed to encode thumbnail: %w", err)
	}

	if err := r.uploadToR2(thumbKey, thumbBuffer.Bytes(), getContentType(ext)); err != nil {
		return nil, fmt.Errorf("failed to upload thumbnail: %w", err)
	}

	return &UploadResult{
		Key:          mainKey,
		URL:          r.GetPublicURL(mainKey),
		ThumbnailKey: thumbKey,
		ThumbnailURL: r.GetPublicURL(thumbKey),
	}, nil
}

// uploadToR2 uploads raw data to R2
func (r *R2Service) uploadToR2(key string, data []byte, contentType string) error {
	_, err := r.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(r.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
	})
	return err
}

// DeleteImage deletes an image and its thumbnail from R2
func (r *R2Service) DeleteImage(key string) error {
	// Delete main image
	_, err := r.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete main image: %w", err)
	}

	// Try to delete thumbnail (don't fail if it doesn't exist)
	thumbKey := strings.Replace(key, filepath.Ext(key), "_thumb"+filepath.Ext(key), 1)
	r.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(thumbKey),
	})

	return nil
}

// DeleteImages deletes multiple images from R2
func (r *R2Service) DeleteImages(keys []string) error {
	for _, key := range keys {
		if err := r.DeleteImage(key); err != nil {
			// Log error but continue deleting others
			fmt.Printf("Failed to delete image %s: %v\n", key, err)
		}
	}
	return nil
}

// GetPublicURL returns the public URL for a key
func (r *R2Service) GetPublicURL(key string) string {
	if r.publicURL == "" {
		return key
	}
	return fmt.Sprintf("%s/%s", strings.TrimSuffix(r.publicURL, "/"), key)
}

// Helper function to encode image based on extension
func encodeImage(w io.Writer, img image.Image, ext string) error {
	switch ext {
	case ".jpg", ".jpeg":
		return jpeg.Encode(w, img, &jpeg.Options{Quality: JPEGQuality})
	case ".png":
		return imaging.Encode(w, img, imaging.PNG)
	case ".gif":
		return imaging.Encode(w, img, imaging.GIF)
	case ".webp":
		// WebP not natively supported, convert to JPEG
		return jpeg.Encode(w, img, &jpeg.Options{Quality: JPEGQuality})
	default:
		return jpeg.Encode(w, img, &jpeg.Options{Quality: JPEGQuality})
	}
}

// Helper function to get content type
func getContentType(ext string) string {
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	default:
		return "image/jpeg"
	}
}
