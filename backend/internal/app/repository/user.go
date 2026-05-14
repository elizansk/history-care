package repository

import "history-care-texnology/internal/models"

func (r *Repository) GetAllUsers() ([]models.User, error) {
	var users []models.User
	err := r.DB.
		Preload("Role").
		Find(&users).Error
	return users, err
}
