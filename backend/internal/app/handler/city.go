package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

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
