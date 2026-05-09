// @title History Care API
// @version 1.0
// @description API documentation for History Care
// @host localhost:8080
// @BasePath /
// @schemes http
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
// @securityDefinitions.apikey CookieAuth
// @in cookie
// @name token

package api

import (
	"fmt"
	"history-care-texnology/docs"
	"history-care-texnology/internal/app/handler"
	"history-care-texnology/internal/app/middleware"
	"history-care-texnology/internal/app/repository"
	"history-care-texnology/internal/logger"
	"history-care-texnology/internal/metrics"
	"history-care-texnology/internal/storage"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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
	storage.InitMinio()
	redisClient := redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_HOST"),
	})

	h := handler.NewHandler(repo, redisClient)
	docs.SwaggerInfo.Title = "History Care API"
	docs.SwaggerInfo.Description = "API documentation for History Care"
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.Host = "localhost:8080"
	docs.SwaggerInfo.BasePath = "/"
	docs.SwaggerInfo.Schemes = []string{"http"}
	r := gin.Default()
	r.Use(metrics.MetricsMiddleware())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"X-Cache", "Content-Length"},
		AllowCredentials: true,
	}))
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	//  2. Auth API для React
	authAPI := r.Group("/api/auth")
	{
		authAPI.POST("/login", h.Login)
		authAPI.POST("/register", h.Register)
		authAPI.GET("/cities", h.GetCities) //вызывает все города
	}

	baseAPI := r.Group("/api")
	{
		baseAPI.GET("/orders/formed", h.GetDonatableOrders)
		baseAPI.GET("/categories", h.GetCategories)
		baseAPI.GET("/orders/:id", h.GetOrderByID) // Домен заявки GET одна запись
		baseAPI.POST("/donations", h.PostDonate)   // POST donation
	}

	// 3. Protected API для всех авторизованных пользователей
	protectedAPI := r.Group("/api")
	protectedAPI.Use(middleware.AuthMiddleware(redisClient))
	{
		protectedAPI.GET("/profile", h.GetProfile)
		protectedAPI.POST("/auth/logout", h.Logout)
	}

	// 4. Protected API для City + Admin
	cityAPI := r.Group("/api")
	cityAPI.Use(middleware.AuthMiddleware(redisClient, "City", "Admin"))
	{
		cityAPI.GET("/orders", h.GetOrders)           // Домен заявки GET список
		cityAPI.GET("/orders/draft", h.GetDraftOrder) // Домен заявки GET иконки корзины

		cityAPI.POST("/orders/services", h.AddServiceToDraft)                    // Домен м-м POST добавления в заявку-черновик
		cityAPI.PUT("/orders/services/:service_id", h.UpdateServiceInDraft)      // Домен м-м PUT изменение price
		cityAPI.DELETE("/orders/services/:service_id", h.DeleteServiceFromDraft) // Домен м-м DELETE удаление из заявки

		cityAPI.PUT("/orders/:id", h.UpdateOrder)    // Домен заявки PUT изменения полей заявки
		cityAPI.DELETE("/orders/:id", h.DeleteOrder) // Домен заявки DELETE удаление

		cityAPI.PUT("/orders/:id/form", h.FormOrder) // PUT сформировать создателем

		cityAPI.GET("/services", h.GetServices)
		cityAPI.GET("/services/:id", h.GetServiceByID)

		cityAPI.POST("/buildings", h.CreateBuilding)      // Создать здание
		cityAPI.POST("/orders/draft", h.CreateDraftOrder) // Создать draft заявки
		cityAPI.POST("/order/delete/:id", h.DeleteOrder)
	}

	// 5. Protected API для Admin
	adminAPI := r.Group("/api")
	adminAPI.Use(middleware.AuthMiddleware(redisClient, "Admin"))
	{
		adminAPI.GET("/users", h.GetUsers)
		adminAPI.PUT("/orders/:id/moderate", h.ModerateOrder) // PUT завершить/отклонить модератором
		adminAPI.DELETE("/services/:id", h.DeleteService)
		adminAPI.POST("/services", h.CreateService)
		adminAPI.POST("/services/all", h.GetAllServices)
	}

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}
