package repository

import "history-care-texnology/internal/models"

func (r *Repository) CreateOrder(order *models.ReconstructionOrder) error {
	return r.DB.Create(order).Error
}

func (r *Repository) UpdateOrderTotal(orderID uint, total float64) error {
	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Update("total_amount", total).Error
}

// ===== ЗДАНИЕ =====
func (r *Repository) CreateBuilding(b *models.Building) error {
	return r.DB.Create(b).Error
}

// ===== УСЛУГИ =====
func (r *Repository) GetServices() ([]models.BuildingService, error) {
	var services []models.BuildingService
	err := r.DB.Find(&services).Error
	return services, err
}

func (r *Repository) GetServiceByID(id uint) (models.BuildingService, error) {
	var service models.BuildingService
	err := r.DB.First(&service, id).Error
	return service, err
}

func (r *Repository) AddServices(services []models.OrderService) error {
	return r.DB.Create(&services).Error
}

// ===== РЕСУРСЫ =====
func (r *Repository) AddResources(resources []models.BuildingResource) error {
	return r.DB.Create(&resources).Error
}

// ===== СПРАВОЧНИКИ =====
func (r *Repository) GetCategories() ([]models.BuildingCategory, error) {
	var data []models.BuildingCategory
	err := r.DB.Find(&data).Error
	return data, err
}

func (r *Repository) DeleteReconstructionOrder(orderID uint) error {
	sql := `UPDATE reconstruction_orders SET status = 'deleted' WHERE id = $1`
	return r.DB.Exec(sql, orderID).Error
}
