package repository

import (
	"history-care-texnology/internal/models"
)

func (r *Repository) CheckServiceInOrder(orderID, serviceID uint) (bool, error) {
	var count int64

	err := r.DB.Model(&models.OrderService{}).
		Where("order_id = ? AND service_id = ?", orderID, serviceID).
		Count(&count).Error

	return count > 0, err
}

func (r *Repository) AddOrderService(orderID uint, serviceID uint, price float64) error {
	return r.DB.Create(&models.OrderService{
		OrderID:   orderID,
		ServiceID: serviceID,
		Price:     price,
	}).Error
}
func (r *Repository) DeleteOrderService(orderID, serviceID uint) error {
	return r.DB.
		Where("order_id = ? AND service_id = ?", orderID, serviceID).
		Delete(&models.OrderService{}).Error
}

func (r *Repository) UpdateOrderService(orderID, serviceID uint, price float64) error {
	return r.DB.Model(&models.OrderService{}).
		Where("order_id = ? AND service_id = ?", orderID, serviceID).
		Updates(map[string]interface{}{
			"price": price,
		}).Error
}
