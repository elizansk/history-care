package models

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	FirstName string `gorm:"size:100;not null" json:"first_name"`
	LastName  string `gorm:"size:100;not null" json:"last_name"`
	Email     string `gorm:"size:100;unique;not null" json:"email"`
	Role      string `gorm:"size:20;default:user" json:"role"`
	Password  string `gorm:"size:100;null" json:"-"`

	CityID *uint `json:"city_id"`
	City   *City `gorm:"foreignKey:CityID" json:"city"`
}

type BuildingCategory struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"size:255;not null" json:"name"`
}

type Building struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"size:255;not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	Address     string `gorm:"type:text" json:"address"`

	CategoryID uint             `json:"category_id"`
	Category   BuildingCategory `json:"category"`

	CityID uint `json:"city_id"`
	City   City `gorm:"foreignKey:CityID" json:"city"`

	Resources            []BuildingResource    `gorm:"foreignKey:BuildingID" json:"resources"`
	ReconstructionOrders []ReconstructionOrder `gorm:"foreignKey:BuildingID" json:"orders"`
}

type BuildingResource struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	BuildingID   uint   `json:"building_id"`
	ResourceType string `gorm:"type:text;check:resource_type IN ('photo','video')" json:"resource_type"`
	URL          string `gorm:"type:text;not null" json:"url"`
	IsMain       bool   `json:"is_main"`
}

type BuildingService struct {
	ID           uint    `gorm:"primaryKey" json:"id"`
	Name         string  `gorm:"size:255;not null" json:"name"`
	Description  string  `gorm:"type:text" json:"description"`
	DurationDays int     `json:"duration_days"`
	Price        float64 `json:"price"`
}

type ReconstructionOrder struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	BuildingID  uint       `json:"building_id"`
	Building    Building   `json:"building"`
	CreatorID   uint       `json:"creator_id"`
	Creator     User       `json:"creator"`
	Status      string     `gorm:"size:50;default:'draft'" json:"status"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
	CompletedAt *time.Time `json:"completed_at"`

	TotalAmount     float64 `json:"total_amount"`
	CollectedAmount float64 `json:"collected_amount"`

	Services  []OrderService `gorm:"foreignKey:OrderID" json:"services"`
	Donations []Donation     `gorm:"foreignKey:OrderID" json:"donations"`
}

type OrderService struct {
	ID          uint                `gorm:"primaryKey" json:"id"`
	OrderID     uint                `json:"order_id"`
	Order       ReconstructionOrder `json:"order"`
	ServiceID   uint                `json:"service_id"`
	Service     BuildingService     `json:"service"`
	Description string              `json:"description"`
	Price       float64             `json:"price"`
	Quantity    int                 `gorm:"default:1" json:"quantity"`
	Result      float64             `json:"result"`
}

type Donation struct {
	ID        uint                `gorm:"primaryKey" json:"id"`
	OrderID   uint                `json:"order_id"`
	Order     ReconstructionOrder `json:"order"`
	UserID    *uint               `json:"user_id"`
	User      User                `json:"user"`
	Amount    float64             `json:"amount"`
	CreatedAt time.Time           `gorm:"autoCreateTime" json:"created_at"`
}

type City struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"size:100;unique;not null" json:"name"`
}
