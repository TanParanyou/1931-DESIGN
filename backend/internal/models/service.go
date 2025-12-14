package models

// ServiceCategory - หมวดหมู่บริการ
type ServiceCategory struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	BusinessID uint   `json:"business_id"`
	NameTH     string `json:"name_th"`
	NameEN     string `json:"name_en"`
	SortOrder  int    `json:"sort_order" gorm:"default:0"`
	IsActive   bool   `json:"is_active" gorm:"default:true"`

	// Relations
	Services []Service `json:"services,omitempty" gorm:"foreignKey:CategoryID"`
}

// Service - บริการ/สินค้า
type Service struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	BusinessID  uint    `json:"business_id"`
	CategoryID  *uint   `json:"category_id"` // nullable - ไม่บังคับมีหมวดหมู่
	NameTH      string  `json:"name_th"`
	NameEN      string  `json:"name_en"`
	DescTH      string  `json:"desc_th" gorm:"type:text"`
	DescEN      string  `json:"desc_en" gorm:"type:text"`
	Price       float64 `json:"price"`
	PriceText   string  `json:"price_text"`   // เช่น "เริ่มต้น 500 บาท"
	DurationMin int     `json:"duration_min"` // ระยะเวลา (นาที)
	ImageURL    string  `json:"image_url"`
	SortOrder   int     `json:"sort_order" gorm:"default:0"`
	IsActive    bool    `json:"is_active" gorm:"default:true"`

	// Relations
	Category *ServiceCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
}
