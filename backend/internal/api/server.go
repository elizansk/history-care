package api

import (
	"fmt"
	"log"
	"os"

	"history-care-texnology/internal/app/handler"
	"history-care-texnology/internal/app/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func StartServer() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "development"
	}

	envFile := fmt.Sprintf("../backend/.env.%s", env)
	if env == "development" && !fileExists(envFile) {

		envFile = "../backend/.env"
	}

	if err := godotenv.Load(envFile); err != nil {
		log.Printf("No %s file found, using system environment variables", envFile)
	}

	templatesPath := os.Getenv("TEMPLATES_PATH")
	staticPath := os.Getenv("STATIC_PATH")

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	repo, err := repository.NewRepository(dsn)
	if err != nil {
		log.Fatal("failed to connect to DB:", err)
	}

	h := handler.NewHandler(repo)

	r := gin.Default()
	r.LoadHTMLGlob(templatesPath)
	r.Static("/static", staticPath)

	r.GET("/", func(c *gin.Context) { c.Redirect(302, "/buildings") })
	r.GET("/buildings", h.GetBuildings)
	r.GET("/building/:id", h.GetBuilding)
	r.GET("/donate/:id", h.GetDonate)
	r.POST("/donate/:id", h.PostDonate)
	r.POST("/order/delete/:id", h.DeleteOrder)

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}
