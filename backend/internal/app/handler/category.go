package handler

import (
	"context"
	"encoding/json"
	"history-care-texnology/internal/logger"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// @Summary      Get all categories
// @Description  Возвращает список категорий
// @Tags         categories
// @Produce      json
// @Success      200 {array} models.BuildingCategory
// @Failure      500 {object} map[string]string
// @Router       /api/categories [get]
func (h *Handler) GetCategories(c *gin.Context) {
	ctx := context.Background()
	cacheKey := "categories:all"

	// 1. cache GET
	cached, err := h.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		logger.CacheHit(cacheKey)
		c.Header("X-Cache", "HIT")
		c.Data(http.StatusOK, "application/json", []byte(cached))
		return
	}

	// если ошибка НЕ redis nil → логируем error
	if err != nil && err.Error() != "redis: nil" {
		logger.CacheError(cacheKey, err, "get")
	}

	logger.CacheMiss(cacheKey)

	// 2. DB
	data, err := h.repo.GetCategories()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	// 3. SET cache
	jsonData, err := json.Marshal(data)
	if err == nil {
		err := h.redis.Set(ctx, cacheKey, jsonData, time.Minute*2).Err()
		if err != nil {
			logger.CacheError(cacheKey, err, "set")
		} else {
			logger.CacheSet(cacheKey)
		}
	}

	c.Header("X-Cache", "MISS")
	c.JSON(200, data)
}
