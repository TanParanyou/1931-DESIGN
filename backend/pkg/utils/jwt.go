package utils

import (
	"errors"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func getSecret() []byte {
	if len(jwtSecret) == 0 {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			// Fallback for development if not set, but should be set in .env
			return []byte("secret")
		}
		jwtSecret = []byte(secret)
	}
	return jwtSecret
}

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateTokens(userID uint, username string) (string, string, error) {
	// Access Token (15 minutes)
	accessClaims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	signedAccessToken, err := accessToken.SignedString(getSecret())
	if err != nil {
		return "", "", err
	}

	// Refresh Token (7 days)
	refreshClaims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString(getSecret())
	if err != nil {
		return "", "", err
	}

	return signedAccessToken, signedRefreshToken, nil
}

func ParseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func GetUserIDFromContext(c *fiber.Ctx) (uint, error) {
	userID := c.Locals("user_id")
	if userID == nil {
		return 0, errors.New("user id not found in context")
	}
	// Fiber Locals can store various types, safe assertion
	switch v := userID.(type) {
	case uint:
		return v, nil
	case float64: // JSON numbers are often float64
		return uint(v), nil
	case int:
		return uint(v), nil
	default:
		return 0, errors.New("invalid user id format")
	}
}
