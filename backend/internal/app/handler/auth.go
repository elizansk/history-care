package handler

import (
	"context"
	"history-care-texnology/internal/app/jwt"
	"history-care-texnology/internal/logger"
	"history-care-texnology/internal/metrics"
	"history-care-texnology/internal/models"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

// Запросы
type RegisterRequest struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required"`
	Role      string `json:"role" binding:"required"`
	CityID    *uint  `json:"cityId"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// @Summary      Get all cities
// @Description  Возвращает список городов
// @Tags         auth
// @Produce      json
// @Success      200 {array} models.City
// @Failure      500 {object} map[string]string
// @Router       /api/auth/cities [get]
func (h *Handler) GetCities(c *gin.Context) {
	cities, err := h.repo.GetCities()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get cities",
		})
		return
	}

	c.JSON(http.StatusOK, cities)
}

// Password helpers
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// RegisterRequest ...
// @Summary      Register a new user
// @Description  Создает нового пользователя и возвращает JWT
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        registerRequest body RegisterRequest true "User registration data"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /api/auth/register [post]
func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := models.User{
		Name:      req.FirstName + " " + req.LastName,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Password:  hashedPassword,
		Role:      req.Role,
		CityID:    req.CityID,
	}

	if err := h.repo.CreateUser(&user); err != nil {
		log.Printf("CreateUser error: %+v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	token, err := jwt.GenerateJWT(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}
	logger.Log.WithFields(logrus.Fields{
		"user_id": user.ID,
		"email":   user.Email,
		"method":  c.Request.Method,
		"path":    c.Request.URL.Path,
	}).Info("New user created")

	c.SetCookie(
		"token", // имя
		token,   // JWT
		3600,    // TTL
		"/",
		"",    // domain ( ост пустым)
		false, // secure
		true,  // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

// ---- Login ----
// LoginRequest ...
// @Summary      User login
// @Description  Логин пользователя, возвращает JWT
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        loginRequest body LoginRequest true "Login credentials"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]string
// @Failure      401 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /api/auth/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		metrics.AuthAttempts.WithLabelValues("failed").Inc()
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.repo.GetUserByEmail(req.Email)
	if err != nil {
		logger.Log.WithFields(logrus.Fields{
			"email":  req.Email,
			"method": c.Request.Method,
			"path":   c.Request.URL.Path,
			"error":  err,
		}).Error("user not found")
		metrics.AuthAttempts.WithLabelValues("failed").Inc()
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	if !checkPassword(req.Password, user.Password) {
		logger.Log.WithFields(logrus.Fields{
			"user_id": user.ID,
			"email":   user.Email,
			"method":  c.Request.Method,
			"path":    c.Request.URL.Path,
			"error":   err,
		}).Error("wrong password")
		metrics.AuthAttempts.WithLabelValues("failed").Inc()
		c.JSON(http.StatusUnauthorized, gin.H{"error": "wrong password"})
		return
	}

	// Генерация JWT с ролью
	token, err := jwt.GenerateJWT(user.ID, user.Role)
	if err != nil {
		logger.Log.WithFields(logrus.Fields{
			"user_id": user.ID,
			"email":   user.Email,
			"method":  c.Request.Method,
			"path":    c.Request.URL.Path,
			"error":   err,
		}).Error("failed to generate token")
		metrics.AuthAttempts.WithLabelValues("failed").Inc()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}
	logger.Log.WithFields(logrus.Fields{
		"user_id": user.ID,
		"email":   user.Email,
		"method":  c.Request.Method,
		"path":    c.Request.URL.Path,
	}).Info("user login")
	metrics.AuthAttempts.WithLabelValues("success").Inc()
	c.SetCookie(
		"token", // имя
		token,   // JWT
		3600,    // TTL
		"/",
		"",
		false, // secure
		true,  // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

// @Summary      User logout
// @Description  выход пользователя
// @Tags         auth
// @Accept       json
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Router       /api/auth/logout [post]
func (h *Handler) Logout(c *gin.Context) {
	token, err := c.Cookie("token")
	if err == nil {
		ctx := context.Background()
		_ = h.redis.Set(ctx, "blacklist:"+token, "1", time.Hour).Err()
	}

	c.SetCookie("token", "", -1, "/", "", false, true)

	c.JSON(200, gin.H{"message": "logged out"})
}
