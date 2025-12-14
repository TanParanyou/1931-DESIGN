package utils

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"unicode"
)

// PasswordStrengthResult ผลลัพธ์การตรวจสอบความปลอดภัยรหัสผ่าน
type PasswordStrengthResult struct {
	IsValid  bool     `json:"is_valid"`
	Score    int      `json:"score"`    // 0-5 (0=weak, 5=strong)
	Messages []string `json:"messages"` // ข้อความแสดง requirements ที่ไม่ผ่าน
}

// ValidatePasswordStrength ตรวจสอบความปลอดภัยรหัสผ่าน
// Requirements:
// - ความยาวขั้นต่ำ 8 ตัวอักษร
// - ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว
// - ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
// - ต้องมีตัวเลขอย่างน้อย 1 ตัว
// - ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว
func ValidatePasswordStrength(password string) PasswordStrengthResult {
	var messages []string
	score := 0

	// Check minimum length (8 characters)
	if len(password) < 8 {
		messages = append(messages, "Password must be at least 8 characters long")
	} else {
		score++
		if len(password) >= 12 {
			score++ // Bonus for longer password
		}
	}

	// Check for lowercase
	hasLower := false
	for _, c := range password {
		if unicode.IsLower(c) {
			hasLower = true
			break
		}
	}
	if !hasLower {
		messages = append(messages, "Password must contain at least one lowercase letter")
	} else {
		score++
	}

	// Check for uppercase
	hasUpper := false
	for _, c := range password {
		if unicode.IsUpper(c) {
			hasUpper = true
			break
		}
	}
	if !hasUpper {
		messages = append(messages, "Password must contain at least one uppercase letter")
	} else {
		score++
	}

	// Check for digit
	hasDigit := false
	for _, c := range password {
		if unicode.IsDigit(c) {
			hasDigit = true
			break
		}
	}
	if !hasDigit {
		messages = append(messages, "Password must contain at least one digit")
	} else {
		score++
	}

	// Check for special character
	specialChars := "!@#$%^&*()_+-=[]{}|;':\",./<>?"
	hasSpecial := strings.ContainsAny(password, specialChars)
	if !hasSpecial {
		messages = append(messages, "Password must contain at least one special character (!@#$%^&*...)")
	} else {
		score++
	}

	// Cap score at 5
	if score > 5 {
		score = 5
	}

	return PasswordStrengthResult{
		IsValid:  len(messages) == 0,
		Score:    score,
		Messages: messages,
	}
}

// ValidatePIN ตรวจสอบ PIN ว่าถูกต้องหรือไม่
// Requirements: 6 หลัก ตัวเลขเท่านั้น
func ValidatePIN(pin string) (bool, string) {
	if len(pin) != 6 {
		return false, "PIN must be exactly 6 digits"
	}

	for _, c := range pin {
		if !unicode.IsDigit(c) {
			return false, "PIN must contain only digits"
		}
	}

	return true, ""
}

// GenerateResetToken สร้าง random token สำหรับ reset password
func GenerateResetToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
