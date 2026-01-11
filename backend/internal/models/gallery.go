package models

// Gallery - รูปภาพในแกลเลอรี
type Gallery struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	BusinessID uint   `json:"business_id"`
	ImageURL   string `json:"image_url"`
	Caption    string `json:"caption"`
	SortOrder  int    `json:"sort_order" gorm:"default:0"`
}
