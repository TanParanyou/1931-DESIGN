package handlers

import (
	"backend/internal/models"
	"testing"

	"github.com/go-playground/validator/v10"
)

func TestContactValidation(t *testing.T) {
	validate := validator.New()

	tests := []struct {
		name    string
		contact models.Contact
		wantErr bool
	}{
		{
			name: "Valid Contact",
			contact: models.Contact{
				Name:    "John Doe",
				Email:   "john@example.com",
				Subject: "Hello",
				Message: "This is a valid message.",
			},
			wantErr: false,
		},
		{
			name: "Invalid Email",
			contact: models.Contact{
				Name:    "John Doe",
				Email:   "invalid-email",
				Subject: "Hello",
				Message: "This is a valid message.",
			},
			wantErr: true,
		},
		{
			name: "Short Name",
			contact: models.Contact{
				Name:    "J",
				Email:   "john@example.com",
				Subject: "Hello",
				Message: "This is a valid message.",
			},
			wantErr: true,
		},
		{
			name: "Missing Fields",
			contact: models.Contact{
				Name:  "John Doe",
				Email: "john@example.com",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validate.Struct(tt.contact)
			if (err != nil) != tt.wantErr {
				t.Errorf("Contact validation error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
