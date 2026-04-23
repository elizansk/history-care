package repository

import "history-care-texnology/internal/models"

func (r *Repository) CreateBuildingResources(resources []models.BuildingResource) error {
	return r.DB.Create(&resources).Error
}
