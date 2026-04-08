package repository

import (
	"history-care-texnology/internal/models"

	"gorm.io/gorm"
)

func (r *Repository) GetBuildings(regionID, categoryID uint) ([]models.Building, error) {
	var buildings []models.Building

	query := r.DB.Preload("Resources").Preload("ReconstructionOrders")

	if regionID != 0 {
		query = query.Where("region_id = ?", regionID)
	}

	if categoryID != 0 {
		query = query.Where("category_id = ?", categoryID)
	}

	if err := query.Find(&buildings).Error; err != nil {
		return nil, err
	}

	// фильтрация (бизнес-логика, кстати лучше вынести потом в service)
	var filtered []models.Building
	for _, b := range buildings {
		keep := false

		for _, ro := range b.ReconstructionOrders {
			if ro.Status != "deleted" {
				keep = true
				break
			}
		}

		if keep || len(b.ReconstructionOrders) == 0 {
			filtered = append(filtered, b)
		}
	}

	return filtered, nil
}

func (r *Repository) GetBuilding(id uint) (models.Building, error) {
	var building models.Building

	err := r.DB.Preload("Resources").
		Preload("ReconstructionOrders", func(db *gorm.DB) *gorm.DB {
			return db.Preload("Creator").
				Preload("Services").
				Preload("Donations")
		}).
		First(&building, id).Error

	return building, err
}
