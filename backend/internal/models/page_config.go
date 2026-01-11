package models

// PageConfig - การตั้งค่าหน้าเว็บโปรไฟล์
type PageConfig struct {
	ID           uint   `json:"id" gorm:"primaryKey"`
	BusinessID   uint   `json:"business_id" gorm:"unique"`      // 1 ร้าน มี 1 config
	ThemeJSON    string `json:"theme_json" gorm:"type:text"`    // สี, font
	SectionsJSON string `json:"sections_json" gorm:"type:text"` // ลำดับ sections
	SEOJSON      string `json:"seo_json" gorm:"type:text"`      // title, description, og image
}

// Theme - โครงสร้าง JSON สำหรับ ThemeJSON
type Theme struct {
	PrimaryColor   string `json:"primary_color"`
	SecondaryColor string `json:"secondary_color"`
	FontFamily     string `json:"font_family"`
	LayoutType     string `json:"layout_type"` // modern, classic, minimal
}

// Section - โครงสร้าง JSON สำหรับ SectionsJSON
type Section struct {
	Type    string `json:"type"`    // hero, about, services, gallery, contact
	Enabled bool   `json:"enabled"` // เปิด/ปิด section
	Order   int    `json:"order"`   // ลำดับการแสดงผล
}

// SEO - โครงสร้าง JSON สำหรับ SEOJSON
type SEO struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	OGImage     string `json:"og_image"`
	Keywords    string `json:"keywords"`
}
