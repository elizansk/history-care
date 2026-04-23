package handler

import "github.com/gin-gonic/gin"

// @Summary      Get all categories
// @Security ApiKeyAuth
// @Description  Возвращает список категорий
// @Tags         categories
// @Produce      json
// @Success      200 {array} models.BuildingCategory
// @Failure      500 {object} map[string]string
// @Router       /api/categories [get]
func (h *Handler) GetCategories(c *gin.Context) {
	data, err := h.repo.GetCategories()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}
	c.JSON(200, data)
}
