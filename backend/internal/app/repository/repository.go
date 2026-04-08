package repository

import (
	"history-care-texnology/internal/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Repository struct {
	DB *gorm.DB
}

func (r *Repository) GetCities() ([]models.City, error) {
	var cities []models.City

	if err := r.DB.Order("name").Find(&cities).Error; err != nil {
		return nil, err
	}

	return cities, nil
}
func NewRepository(dsn string) (*Repository, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("ошибка подключения к БД: %v", err)
		return nil, err
	}
	return &Repository{DB: db}, nil
}
