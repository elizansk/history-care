package repository

import (
	"history-care-texnology/internal/models"
)

func (r *Repository) GetUserByID(id uint) (models.User, error) {
	var user models.User

	err := r.DB.First(&user, id).Error
	return user, err
}
