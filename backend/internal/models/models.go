package models

import "time"

type User struct {
	ID    uint   `gorm:"primaryKey"`
	Name  string `gorm:"size:100;not null"`
	Email string `gorm:"size:100;unique;not null"`
	Role  string `gorm:"size:20;default:user"`
}

type Region struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"size:100;unique;not null"`
}

type BuildingCategory struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"size:255;not null"`
}

type Building struct {
	ID                   uint   `gorm:"primaryKey"`
	Name                 string `gorm:"size:255;not null"`
	Description          string `gorm:"type:text"`
	Address              string `gorm:"type:text"`
	CategoryID           uint
	Category             BuildingCategory
	RegionID             uint
	Region               Region
	Resources            []BuildingResource    `gorm:"foreignKey:BuildingID"`
	ReconstructionOrders []ReconstructionOrder `gorm:"foreignKey:BuildingID"`
}

type BuildingResource struct {
	ID           uint `gorm:"primaryKey"`
	BuildingID   uint
	ResourceType string `gorm:"type:text;check:resource_type IN ('photo','video')"`
	URL          string `gorm:"type:text;not null"`
}

type BuildingService struct {
	ID           uint   `gorm:"primaryKey"`
	Name         string `gorm:"size:255;not null"`
	Description  string `gorm:"type:text"`
	DurationDays int
	Price        float64
}

type ReconstructionOrder struct {
	ID              uint `gorm:"primaryKey"`
	BuildingID      uint
	Building        Building
	CreatorID       uint
	Creator         User
	Status          string    `gorm:"size:50;default:'draft'"`
	CreatedAt       time.Time `gorm:"autoCreateTime"`
	CompletedAt     *time.Time
	TotalAmount     float64
	CollectedAmount float64
	Services        []OrderService `gorm:"foreignKey:OrderID"`
	Donations       []Donation     `gorm:"foreignKey:OrderID"`
}

type OrderService struct {
	ID          uint `gorm:"primaryKey"`
	OrderID     uint
	Order       ReconstructionOrder
	ServiceID   uint
	Service     BuildingService
	Description string
	Price       float64
	Quantity    int `gorm:"default:1"`
	Result      float64
}

type Donation struct {
	ID        uint `gorm:"primaryKey"`
	OrderID   uint
	Order     ReconstructionOrder
	UserID    uint
	User      User
	Amount    float64
	CreatedAt time.Time `gorm:"autoCreateTime"`
}
