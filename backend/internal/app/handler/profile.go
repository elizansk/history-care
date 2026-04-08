package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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
