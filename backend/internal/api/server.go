// @title History Care API
// @version 1.0
// @description API documentation for History Care
// @host localhost:8080
// @BasePath /
// @schemes http
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization

package api

import (
	"history-care-texnology/docs"
	"history-care-texnology/internal/storage"
)
import (
	"fmt"
	"history-care-texnology/internal/app/handlerOld"
	"history-care-texnology/internal/app/middleware"
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

	"github.com/swaggo/files"
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
	storage.InitMinio()

	h := handler.NewHandler(repo)
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
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	// ==== 1. HTML + статика ====
	r.LoadHTMLGlob(templatesPath)
	r.Static("/static", staticPath)

	oldHandler := handlerOld.OldHandler(repo)

	r.GET("/metrics", gin.WrapH(promhttp.Handler()))
	r.GET("/", func(c *gin.Context) { c.Redirect(302, "/buildings") })
	r.GET("/buildings", oldHandler.GetBuildings)
	r.GET("/building/:id", oldHandler.GetBuilding)
	r.GET("/donate/:id", oldHandler.GetDonate)
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
	protectedAPI.Use(middleware.AuthMiddleware())
	{
		protectedAPI.GET("/profile", h.GetProfile)
	}

	// ==== 4. Protected API для City + Admin ====
	cityAPI := r.Group("/api")
	cityAPI.Use(middleware.AuthMiddleware("City", "Admin"))
	{

		cityAPI.GET("/services", h.GetServices)
		cityAPI.GET("/categories", h.GetCategories)
		cityAPI.POST("/orders", h.CreateOrder)
		cityAPI.GET("/myorders", h.CreateOrder)
	}

	// ==== 5. Protected API для Admin ====
	adminAPI := r.Group("/api")
	adminAPI.Use(middleware.AuthMiddleware("Admin"))
	{
		adminAPI.GET("/users", h.GetUsers)
		cityAPI.GET("/allorders", h.CreateOrder)
	}

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}
