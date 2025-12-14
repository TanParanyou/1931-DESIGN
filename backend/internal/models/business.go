package models

import "time"

// Business - ข้อมูลธุรกิจ/ร้านค้า
type Business struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`                       // เจ้าของธุรกิจ (FK -> users)
	Slug      string    `json:"slug" gorm:"unique"`            // URL slug เช่น yourapp.com/p/my-shop
	NameTH    string    `json:"name_th"`                       // ชื่อภาษาไทย
	NameEN    string    `json:"name_en"`                       // ชื่อภาษาอังกฤษ
	DescTH    string    `json:"desc_th" gorm:"type:text"`      // คำอธิบายภาษาไทย
	DescEN    string    `json:"desc_en" gorm:"type:text"`      // คำอธิบายภาษาอังกฤษ
	LogoURL   string    `json:"logo_url"`                      // โลโก้
	CoverURL  string    `json:"cover_url"`                     // ภาพปก
	Status    string    `json:"status" gorm:"default:'draft'"` // draft, published
	IsActive  bool      `json:"is_active" gorm:"default:true"` // เปิด/ปิดใช้งาน
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	User       User            `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Contact    BusinessContact `json:"contact,omitempty" gorm:"foreignKey:BusinessID"`
	Hours      []BusinessHour  `json:"hours,omitempty" gorm:"foreignKey:BusinessID"`
	Services   []Service       `json:"services,omitempty" gorm:"foreignKey:BusinessID"`
	Gallery    []Gallery       `json:"gallery,omitempty" gorm:"foreignKey:BusinessID"`
	PageConfig PageConfig      `json:"page_config,omitempty" gorm:"foreignKey:BusinessID"`
}

// BusinessContact - ข้อมูลติดต่อธุรกิจ
type BusinessContact struct {
	ID         uint    `json:"id" gorm:"primaryKey"`
	BusinessID uint    `json:"business_id" gorm:"unique"` // 1 ร้าน มี 1 contact
	Phone      string  `json:"phone"`
	Email      string  `json:"email"`
	LineID     string  `json:"line_id"`
	Facebook   string  `json:"facebook"`
	Instagram  string  `json:"instagram"`
	Website    string  `json:"website"`
	MapLat     float64 `json:"map_lat"`
	MapLng     float64 `json:"map_lng"`
	AddressTH  string  `json:"address_th" gorm:"type:text"`
	AddressEN  string  `json:"address_en" gorm:"type:text"`
}

// BusinessHour - เวลาทำการ
type BusinessHour struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	BusinessID uint   `json:"business_id"`
	DayOfWeek  int    `json:"day_of_week"` // 0=Sunday, 6=Saturday
	OpenTime   string `json:"open_time"`   // "09:00"
	CloseTime  string `json:"close_time"`  // "18:00"
	IsClosed   bool   `json:"is_closed" gorm:"default:false"`
}
