package handler

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UpdateProfileRequest struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"omitempty,min=6"`
}

// @Summary      Get user profile
// @Security ApiKeyAuth
// @Description  Возвращает информацию о текущем пользователе
// @Tags         profile
// @Produce      json
// @Success      200 {object} models.User
// @Failure      401 {object} map[string]string
// @Failure      404 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /api/profile [get]
func (h *Handler) GetProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	userID := userIDRaw.(uint)

	user, err := h.repo.GetUserByID(userID)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"name":       user.Name,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"email":      user.Email,
		"role_id":    user.RoleID,
		"role":       user.Role.Name,
	})
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	userID := userIDRaw.(uint)

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.repo.GetUserByID(userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	updates := map[string]interface{}{
		"first_name": strings.TrimSpace(req.FirstName),
		"last_name":  strings.TrimSpace(req.LastName),
		"email":      strings.TrimSpace(req.Email),
	}

	if req.Password != "" {
		hashedPassword, err := hashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
			return
		}
		updates["password"] = hashedPassword
	}

	if err := h.repo.UpdateUser(userID, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "updated"})
}
