package main

import (
	"log"
	"os"

	"history-care-texnology/internal/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "development"
	}

	envFile := "../backend/.env." + env

	if err := godotenv.Load(envFile); err != nil {
		log.Printf("No %s file found, using system env", envFile)
	}

	var a = os.Getenv("DB_HOST")
	log.Println(a)
	db, err := gorm.Open(postgres.Open(getDSN()), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}

	log.Println("Running migrations...")

	if err := db.AutoMigrate(
		&models.User{},
		&models.City{},
		&models.BuildingCategory{},
		&models.Building{},
		&models.BuildingResource{},
		&models.Service{},
		&models.ReconstructionOrder{},
		&models.OrderService{},
		&models.Donation{},
	); err != nil {
		log.Fatal("failed to migrate database:", err)
	}

	log.Println("Migration completed!")
}

func getDSN() string {
	return "host=" + os.Getenv("DB_HOST") +
		" port=" + os.Getenv("DB_PORT") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" sslmode=disable"
}
