package repository

import (
	"history-care-texnology/internal/models"
	"time"

	"gorm.io/gorm"
)

func (r *Repository) GetOrders(status string, from, to *time.Time) ([]models.ReconstructionOrder, error) {

	var orders []models.ReconstructionOrder

	query := r.DB.
		Preload("Creator").
		Preload("Services.Service").
		Where("status NOT IN ?", []string{"deleted", "draft"})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if from != nil {
		query = query.Where("created_at >= ?", *from)
	}

	if to != nil {
		query = query.Where("created_at <= ?", *to)
	}

	err := query.Find(&orders).Error
	return orders, err
}

func (r *Repository) GetDonatableOrders(categoryId, cityId uint, from, to *time.Time) ([]models.ReconstructionOrder, error) {

	var orders []models.ReconstructionOrder

	query := r.DB.
		Model(&models.ReconstructionOrder{}).
		Joins("JOIN buildings ON buildings.id = reconstruction_orders.building_id").
		Preload("Donations").
		Preload("Building").
		Preload("Building.Resources").
		Preload("Building.Category").
		Preload("Building.City").
		Preload("Services.Service").
		Where("reconstruction_orders.status IN ?", []string{"formed", "collection_started"})

	if categoryId != 0 {
		query = query.Where("buildings.category_id = ?", categoryId)
	}

	if cityId != 0 {
		query = query.Where("buildings.city_id = ?", cityId)
	}

	if from != nil {
		query = query.Where("reconstruction_orders.created_at >= ?", *from)
	}

	if to != nil {
		query = query.Where("reconstruction_orders.created_at <= ?", *to)
	}

	err := query.Find(&orders).Error
	return orders, err
}

func (r *Repository) GetOrderByID(id uint) (models.ReconstructionOrder, error) {
	var order models.ReconstructionOrder

	err := r.DB.
		Preload("Services.Service").
		Preload("Donations").
		Preload("Building").
		Preload("Building.Resources").
		Preload("Building.Category").
		Preload("Creator").
		Preload("Building.City").
		First(&order, id).Error

	return order, err
}

func (r *Repository) GetDraftOrder(userID uint) (*models.ReconstructionOrder, error) {
	var order models.ReconstructionOrder

	err := r.DB.
		Where("creator_id = ? AND status = ?", userID, "draft").
		Preload("Services.Service").
		Preload("Building").
		Preload("Building.Resources").
		Preload("Building.Category").
		Preload("Creator").
		Preload("Building.City").
		First(&order).Error

	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *Repository) CreateDraftOrder(userID uint, buildingID uint) (*models.ReconstructionOrder, error) {

	order := models.ReconstructionOrder{
		CreatorID:  userID,
		BuildingID: buildingID,
		Status:     "draft",
	}

	if err := r.DB.Create(&order).Error; err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *Repository) UpdateOrderTotal(orderID uint, total float64) error {
	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Update("total_amount", total).Error
}

func (r *Repository) UpdateOrderFields(orderID uint, name, description, address string, categoryID uint, cityId uint) error {
	return r.DB.Model(&models.Building{}).
		Where("id = (SELECT building_id FROM reconstruction_orders WHERE id = ?)", orderID).
		Updates(map[string]interface{}{
			"name":        name,
			"description": description,
			"address":     address,
			"category_id": categoryID,
		}).Error
}

func (r *Repository) FormOrder(orderID uint, total float64) error {
	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Updates(map[string]interface{}{
			"status":       "formed",
			"total_amount": total,
			"created_at":   time.Now(),
		}).Error
}

func (r *Repository) FinishOrder(orderID uint, status string, adminID uint) error {
	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Updates(map[string]interface{}{
			"status":       status,
			"completed_at": time.Now(),
			"moderator_id": adminID,
		}).Error
}

func (r *Repository) DeleteOrder(id uint) error {
	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", id).
		Update("status", "deleted").Error
}

func (r *Repository) IncrementOrderTotal(orderID uint, price float64) error {
	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Update("total_amount", gorm.Expr("total_amount + ?", price)).Error
}

func (r *Repository) RecalculateOrderTotal(orderID uint) error {
	var total float64

	r.DB.Model(&models.OrderService{}).
		Where("order_id = ?", orderID).
		Select("COALESCE(SUM(price),0)").
		Scan(&total)

	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Update("total_amount", total).Error
}
