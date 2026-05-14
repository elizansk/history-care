package repository

import (
	"history-care-texnology/internal/models"
)

func (r *Repository) GetUserByID(id uint) (models.User, error) {
	var user models.User

	err := r.DB.
		Preload("Role").
		First(&user, id).Error
	return user, err
}

func (r *Repository) UpdateUser(id uint, updates map[string]interface{}) error {
	return r.DB.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error
}
