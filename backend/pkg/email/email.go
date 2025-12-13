package email

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

// SendEmail sends an email using the configured SMTP server.
func SendEmail(to []string, subject string, body string) error {
	smtpHost := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	smtpPort := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	smtpUser := strings.TrimSpace(os.Getenv("SMTP_USER"))
	smtpPassword := strings.TrimSpace(os.Getenv("SMTP_PASSWORD"))
	fromEmail := strings.TrimSpace(os.Getenv("SMTP_FROM_EMAIL"))
	fromName := strings.TrimSpace(os.Getenv("SMTP_FROM_NAME"))

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPassword == "" {
		return fmt.Errorf("SMTP configuration is missing")
	}

	auth := smtp.PlainAuth("", smtpUser, smtpPassword, smtpHost)
	address := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	// Set up headers
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", fromName, fromEmail)
	headers["To"] = to[0] // Simplified for single recipient
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"UTF-8\""

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// Send email
	err := smtp.SendMail(address, auth, fromEmail, to, []byte(message))
	if err != nil {
		return err
	}

	return nil
}

// SendLoginNotification sends an email to the user notifying them of a successful login.
func SendLoginNotification(email string, username string) error {
	subject := "Login Notification"
	body := fmt.Sprintf(`
		<h1>Login Successful</h1>
		<p>Hello %s,</p>
		<p>You have successfully logged into your account.</p>
		<p>If this was not you, please contact support immediately.</p>
	`, username)

	return SendEmail([]string{email}, subject, body)
}
