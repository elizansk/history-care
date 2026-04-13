package handler

import (
	_ "history-care-texnology/internal/models"

	"github.com/gin-gonic/gin"
)

// @Summary      Get all users
// @Security ApiKeyAuth
// @Description  Возвращает список всех пользователей
// @Tags         users
// @Produce      json
// @Success       200 {array} models.User
// @Failure      500 {object} map[string]string
// @Router       /api/users [get]
func (h *Handler) GetUsers(c *gin.Context) {
	users, err := h.repo.GetAllUsers()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch users"})
		return
	}

	c.JSON(200, users)
}
