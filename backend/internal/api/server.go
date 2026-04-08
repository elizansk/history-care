package api

import (
	"fmt"
	"history-care-texnology/internal/logger"
	"log"
	"os"

	"history-care-texnology/internal/app/handler"
	"history-care-texnology/internal/app/repository"
	"history-care-texnology/internal/metrics"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
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
	metrics.Init()
	logger.InitLogger(env)
	logger.Log.Info("Starting backend server")

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
	r.Use(handler.MetricsMiddleware())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// ==== 1. HTML + статика ====
	r.LoadHTMLGlob(templatesPath)
	r.Static("/static", staticPath)

	r.GET("/metrics", gin.WrapH(promhttp.Handler()))
	r.GET("/", func(c *gin.Context) { c.Redirect(302, "/buildings") })
	r.GET("/buildings", h.GetBuildings)
	r.GET("/building/:id", h.GetBuilding)
	r.GET("/donate/:id", h.GetDonate)
	r.POST("/donate/:id", h.PostDonate)
	r.POST("/order/delete/:id", h.DeleteOrder)

	// ==== 2. Auth API для React ====
	authAPI := r.Group("/api/auth")
	{
		authAPI.POST("/login", h.Login)
		authAPI.POST("/register", h.Register)
		authAPI.GET("/cities", h.GetCities)
	}

	// ==== 3. Protected API для всех авторизованных пользователей ====
	protectedAPI := r.Group("/api")
	protectedAPI.Use(handler.AuthMiddleware())
	{
		protectedAPI.GET("/profile", h.GetProfile)
	}

	// ==== 4. Protected API для City + Admin ====
	cityAPI := r.Group("/api")
	cityAPI.Use(handler.AuthMiddleware("City", "Admin"))
	{
		orderRepo := repository.NewOrderRepository(repo.DB)
		orderHandler := handler.NewOrderHandler(orderRepo)

		cityAPI.GET("/services", orderHandler.GetServices)
		cityAPI.GET("/categories", orderHandler.GetCategories)
		cityAPI.GET("/regions", orderHandler.GetRegions)
		cityAPI.POST("/orders", orderHandler.CreateOrder)
	}

	// ==== 5. Protected API для Admin ====
	adminAPI := r.Group("/api")
	adminAPI.Use(handler.AuthMiddleware("Admin"))
	{
		adminAPI.GET("/users", h.GetUsers)
	}

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}
