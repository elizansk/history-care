package handler

import (
	_ "history-care-texnology/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UpdateCityApprovalRequest struct {
	CityApproved bool `json:"city_approved"`
}

// @Summary      Get all users
// @Security ApiKeyAuth
// @Security CookieAuth
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

func (h *Handler) UpdateCityApproval(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var req UpdateCityApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.repo.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	if user.Role.Name != "City" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only city users can be approved"})
		return
	}

	if err := h.repo.UpdateUserCityApproval(uint(userID), req.CityApproved); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update city approval"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"city_approved": req.CityApproved})
}
