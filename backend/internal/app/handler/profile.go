package handler

import (
	"errors"
	_ "history-care-texnology/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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
		"role":       user.Role,
	})
}
