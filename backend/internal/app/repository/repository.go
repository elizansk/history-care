package repository

import (
	"log"

	"history-care-texnology/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Repository struct {
	DB *gorm.DB
}

func NewRepository(dsn string) (*Repository, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("ошибка подключения к БД: %v", err)
		return nil, err
	}
	return &Repository{DB: db}, nil
}

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
			return db.Preload("Creator").Preload("Services").Preload("Donations")
		}).
		First(&building, id).Error
	if err != nil {
		return building, err
	}
	return building, nil
}

func (r *Repository) AddDonation(orderID, userID uint, amount float64) error {
	donation := models.Donation{
		OrderID: orderID,
		UserID:  userID,
		Amount:  amount,
	}
	if err := r.DB.Create(&donation).Error; err != nil {
		return err
	}

	var order models.ReconstructionOrder
	if err := r.DB.First(&order, orderID).Error; err != nil {
		return err
	}

	newCollected := order.CollectedAmount + amount
	newStatus := "collection_started"
	if newCollected >= order.TotalAmount {
		newStatus = "collection_completed"
	}

	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Updates(map[string]interface{}{
			"collected_amount": newCollected,
			"status":           newStatus,
		}).Error
}

func (r *Repository) DeleteReconstructionOrder(orderID uint) error {
	sql := `UPDATE reconstruction_orders SET status = 'deleted' WHERE id = $1`
	return r.DB.Exec(sql, orderID).Error
}
