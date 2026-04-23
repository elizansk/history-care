package repository

import "history-care-texnology/internal/models"

func (r *Repository) GetCategories() ([]models.BuildingCategory, error) {
	var data []models.BuildingCategory
	err := r.DB.Find(&data).Error
	return data, err
}
