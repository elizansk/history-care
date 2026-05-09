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

type Service struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:255;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Status      string    `gorm:"size:50;default:'active'" json:"status"`
	ImageUrl    string    `gorm:"type:text;not null" json:"image_url"`
	VideoUrl    string    `gorm:"type:text;not null" json:"video_url"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
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
	ModeratorID     *uint   `json:"moderator_id"`

	Services  []OrderService `gorm:"foreignKey:OrderID" json:"services"`
	Donations []Donation     `gorm:"foreignKey:OrderID" json:"donations"`
}

type OrderService struct {
	ID          uint                `gorm:"primaryKey" json:"id"`
	OrderID     uint                `json:"order_id"`
	Order       ReconstructionOrder `json:"-"`
	ServiceID   uint                `json:"service_id"`
	Service     Service             `json:"service"`
	Price       float64             `json:"price"`
	Description string              `json:"description"`
}

func (OrderService) TableName() string {
	return "orders_services"
}

type Donation struct {
	ID        uint                `gorm:"primaryKey" json:"id"`
	OrderID   uint                `json:"order_id"`
	Order     ReconstructionOrder `json:"-"`
	UserID    *uint               `json:"user_id"`
	User      User                `json:"-"`
	Name      *string             `json:"name"`
	Email     *string             `json:"email"`
	Amount    float64             `json:"amount"`
	CreatedAt time.Time           `gorm:"autoCreateTime" json:"created_at"`
}

type City struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"size:100;unique;not null" json:"name"`
}
