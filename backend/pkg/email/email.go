package email

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

// SendEmail sends an email using the configured SMTP server.
func SendEmail(to []string, subject string, body string) error {
	return send(to, subject, body, "")
}

// SendContactEmail sends a contact form submission email.
func SendContactEmail(toEmail, replyTo, name, subject, message string) error {
	emailSubject := fmt.Sprintf("New Contact Message: %s", subject)
	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
				.header { background-color: #f8f9fa; padding: 15px; border-bottom: 1px solid #eee; margin-bottom: 20px; }
				.header h2 { margin: 0; color: #333; }
				.field { margin-bottom: 15px; }
				.label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
				.value { margin-top: 5px; }
				.message-box { background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #4CAF50; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h2>New Contact Message</h2>
				</div>
				<div class="field">
					<div class="label">Name</div>
					<div class="value">%s</div>
				</div>
				<div class="field">
					<div class="label">Email</div>
					<div class="value"><a href="mailto:%s">%s</a></div>
				</div>
				<div class="field">
					<div class="label">Subject</div>
					<div class="value">%s</div>
				</div>
				<div class="field">
					<div class="label">Message</div>
					<div class="value message-box">%s</div>
				</div>
				<p style="font-size: 12px; color: #999; margin-top: 30px;">
					This email was sent from the contact form on your website.
				</p>
			</div>
		</body>
		</html>
	`, name, replyTo, replyTo, subject, strings.ReplaceAll(message, "\n", "<br>"))

	// Send to the configured recipient (admin), reply-to is the user
	return send([]string{toEmail}, emailSubject, body, replyTo)
}

func send(to []string, subject string, body string, replyTo string) error {
	smtpHost := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	smtpPort := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	smtpUser := strings.TrimSpace(os.Getenv("SMTP_USER"))
	smtpPassword := strings.TrimSpace(os.Getenv("SMTP_PASSWORD"))
	fromEmail := strings.TrimSpace(os.Getenv("SMTP_FROM_EMAIL"))
	fromName := strings.TrimSpace(os.Getenv("SMTP_FROM_NAME"))

	// Log the configuration (masking password)
	fmt.Printf("SMTP Config: Host=%s, Port=%s, User=%s, From=%s\n", smtpHost, smtpPort, smtpUser, fromEmail)

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPassword == "" {
		fmt.Println("SMTP Error: Missing configuration")
		return fmt.Errorf("SMTP configuration is missing")
	}

	auth := smtp.PlainAuth("", smtpUser, smtpPassword, smtpHost)
	address := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	// Set up headers
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", fromName, fromEmail)
	headers["To"] = to[0] // Simplified for single recipient
	headers["Subject"] = subject
	if replyTo != "" {
		headers["Reply-To"] = replyTo
	}
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"UTF-8\""

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// Send email
	fmt.Println("Sending email via SMTP...")
	err := smtp.SendMail(address, auth, fromEmail, to, []byte(message))
	if err != nil {
		fmt.Printf("SMTP Send Error: %v\n", err)
		return err
	}

	fmt.Println("SMTP Send Success!")
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

// SendPasswordResetEmail ส่ง email พร้อม link สำหรับ reset password
func SendPasswordResetEmail(email, username, resetLink string) error {
	subject := "Password Reset Request"
	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
				.header h1 { color: white; margin: 0; }
				.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
				.button { display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
				.warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-top: 20px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🔐 Password Reset</h1>
				</div>
				<div class="content">
					<p>สวัสดีคุณ %s,</p>
					<p>เราได้รับคำขอ reset password สำหรับบัญชีของคุณ</p>
					<p>คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
					<p style="text-align: center;">
						<a href="%s" class="button">Reset Password</a>
					</p>
					<div class="warning">
						<strong>⚠️ หมายเหตุ:</strong>
						<ul>
							<li>Link นี้จะหมดอายุใน 1 ชั่วโมง</li>
							<li>หากคุณไม่ได้ขอ reset password โปรดเพิกเฉย email นี้</li>
						</ul>
					</div>
				</div>
				<div class="footer">
					<p>Email นี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
				</div>
			</div>
		</body>
		</html>
	`, username, resetLink)

	return SendEmail([]string{email}, subject, body)
}
