package repository

import (
	"history-care-texnology/internal/models"
)

func (r *Repository) AddDonation(orderID uint, userID *uint, amount float64, name *string, email *string) error {
	donation := models.Donation{
		OrderID: orderID,
		UserID:  userID,
		Name:    name,
		Email:   email,
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
		newStatus = "finished"
	}

	return r.DB.Model(&models.ReconstructionOrder{}).
		Where("id = ?", orderID).
		Updates(map[string]interface{}{
			"collected_amount": newCollected,
			"status":           newStatus,
		}).Error
}
