package repository

import "history-care-texnology/internal/models"

func (r *Repository) GetAllServices() ([]models.Service, error) {
	var services []models.Service
	err := r.DB.Find(&services).Error
	return services, err
}

func (r *Repository) GetServices() ([]models.Service, error) {
	var services []models.Service

	err := r.DB.
		Where("status != ?", "deleted").
		Find(&services).Error

	return services, err
}

func (r *Repository) GetServiceByID(id uint) (models.Service, error) {
	var service models.Service

	err := r.DB.First(&service, id).Error
	return service, err
}

func (r *Repository) CreateService(service *models.Service) error {
	return r.DB.Create(service).Error
}

func (r *Repository) DeleteService(id uint) error {
	return r.DB.Model(&models.Service{}).
		Where("id = ?", id).
		Update("status", "deleted").Error
}
