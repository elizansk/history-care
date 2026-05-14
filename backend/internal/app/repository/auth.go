package repository

import "history-care-texnology/internal/models"

// создание пользователя
func (r *Repository) CreateUser(user *models.User) error {
	return r.DB.Create(user).Error
}

// получение пользователя по email (на будущее для login)
func (r *Repository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User

	if err := r.DB.
		Where("email = ?", email).
		Preload("Role").
		First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}
