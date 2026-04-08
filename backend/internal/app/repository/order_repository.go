package repository

import (
	"history-care-texnology/internal/models"

	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// ЗАЯВКА
func (r *OrderRepository) CreateOrder(order *models.ReconstructionOrder) error {
	return r.db.Create(order).Error
}

func (r *OrderRepository) UpdateOrderTotal(orderID uint, total float64) error {
	return r.db.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Update("total_amount", total).Error
}

// ===== ЗДАНИЕ =====
func (r *OrderRepository) CreateBuilding(b *models.Building) error {
	return r.db.Create(b).Error
}

// ===== УСЛУГИ =====
func (r *OrderRepository) GetServices() ([]models.BuildingService, error) {
	var services []models.BuildingService
	err := r.db.Find(&services).Error
	return services, err
}

func (r *OrderRepository) GetServiceByID(id uint) (models.BuildingService, error) {
	var service models.BuildingService
	err := r.db.First(&service, id).Error
	return service, err
}

func (r *OrderRepository) AddServices(services []models.OrderService) error {
	return r.db.Create(&services).Error
}

// ===== РЕСУРСЫ =====
func (r *OrderRepository) AddResources(resources []models.BuildingResource) error {
	return r.db.Create(&resources).Error
}

// ===== СПРАВОЧНИКИ =====
func (r *OrderRepository) GetCategories() ([]models.BuildingCategory, error) {
	var data []models.BuildingCategory
	err := r.db.Find(&data).Error
	return data, err
}

func (r *OrderRepository) GetRegions() ([]models.Region, error) {
	var data []models.Region
	err := r.db.Find(&data).Error
	return data, err
}
