package repository

import "history-care-texnology/internal/models"

func (r *Repository) GetAllUsers() ([]models.User, error) {
	var users []models.User
	err := r.DB.
		Preload("Role").
		Preload("City").
		Find(&users).Error
	return users, err
}

func (r *Repository) UpdateUserCityApproval(id uint, cityApproved bool) error {
	return r.DB.
		Model(&models.User{}).
		Where("id = ?", id).
		Update("city_approved", cityApproved).Error
}
