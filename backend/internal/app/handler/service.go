package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"history-care-texnology/internal/logger"
	"history-care-texnology/internal/metrics"
	"history-care-texnology/internal/models"
	"history-care-texnology/internal/storage"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

// @Summary      Get all services
// @Security ApiKeyAuth
// @Description  Возвращает список всех услуг
// @Security ApiKeyAuth
// @Tags         services
// @Produce      json
// @Success      200 {array} models.Service
// @Failure      500 {object} map[string]string
// @Router       /api/services [get]
func (h *Handler) GetAllServices(c *gin.Context) {
	data, err := h.repo.GetAllServices()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, data)
}

// GET all services
// @Summary      Get services not delited
// @Security ApiKeyAuth
// @Description  Возвращает список не удаленных услуг
// @Tags         services
// @Produce      json
// @Success      200 {array} models.Service
// @Failure      500 {object} map[string]string
// @Router       /api/services [get]
func (h *Handler) GetServices(c *gin.Context) {
	ctx := context.Background()
	// Ключ Redis-кэша для списка активных услуг
	cacheKey := "services:all"

	// Пробуем прочитать список услуг из Redis
	cached, err := h.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		// Redis cache HIT
		logger.CacheHit(cacheKey)
		// Отдаем клиенту признак источника данных
		c.Header("X-Cache", "HIT")
		// Возвращаем данные из кэша
		c.Data(http.StatusOK, "application/json", []byte(cached))
		return

	}
	// Redis cache MISS
	logger.CacheMiss(cacheKey)
	// Если кэша нет, читаем услуги из БД
	data, err := h.repo.GetServices()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get services"})
		return
	}

	// Готовим данные для записи в Redis
	jsonData, err := json.Marshal(data)
	if err == nil {
		// Записываем список услуг в Redis с TTL
		err := h.redis.Set(ctx, cacheKey, jsonData, time.Minute*2).Err()
		if err != nil {
			// Логируем ошибку записи в кэш
			logger.CacheError(cacheKey, err, "set")
		} else {
			// Логируем успешную запись в кэш
			logger.CacheSet(cacheKey)
		}
	}
	if err != nil && err.Error() != "redis: nil" {
		// Логируем ошибку чтения/подготовки кэша
		logger.CacheError(cacheKey, err, "get")
	}

	// Отдаем клиенту признак, что данные пришли не из Redis
	c.Header("X-Cache", "MISS")
	c.JSON(http.StatusOK, data)
}

// @Summary Get service by id
// @Security ApiKeyAuth
// @Tags services
// @Produce json
// @Param id path int true "Service ID"
// @Success 200 {object} models.Service
// @Failure 404 {object} map[string]string
// @Router /api/services/{id} [get]
func (h *Handler) GetServiceByID(c *gin.Context) {
	ctx := context.Background()

	id := c.Param("id")
	// Ключ Redis-кэша для одной услуги
	cacheKey := fmt.Sprintf("services:%s", id)

	// Пробуем прочитать услугу из Redis
	cached, err := h.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		// Redis cache HIT
		logger.CacheHit(cacheKey)
		// Увеличиваем счетчик cache hit
		metrics.CacheHits.Inc()
		// Отдаем клиенту признак источника данных
		c.Header("X-Cache", "HIT")
		// Возвращаем данные из кэша
		c.Data(http.StatusOK, "application/json", []byte(cached))
		return
	}
	// Redis cache MISS
	logger.CacheMiss(cacheKey)
	// Увеличиваем счетчик cache miss
	metrics.CacheMisses.Inc()
	// Если кэша нет, читаем услугу из БД
	idInt, _ := strconv.Atoi(id)
	service, err := h.repo.GetServiceByID(uint(idInt))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	// Готовим услугу для записи в Redis
	jsonData, err := json.Marshal(service)
	if err == nil {
		// Записываем услугу в Redis с TTL
		h.redis.Set(ctx, cacheKey, jsonData, time.Minute*2)
		// Логируем успешную запись в кэш
		logger.CacheSet(cacheKey)
	}
	if err != nil && err.Error() != "redis: nil" {
		// Логируем ошибку чтения/подготовки кэша
		logger.CacheError(cacheKey, err, "get")
	}
	// Отдаем клиенту признак, что данные пришли не из Redis
	c.Header("X-Cache", "MISS")
	c.JSON(http.StatusOK, service)
}

// @Summary Create service
// @Security ApiKeyAuth
// @Tags services
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "Service name"
// @Param description formData string false "Description"
// @Param image formData file true "Service icon file"
// @Success 201 {object} models.Service
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/services [post]
func (h *Handler) CreateService(c *gin.Context) {

	// 1. form data
	name := c.PostForm("name")
	description := c.PostForm("description")

	if name == "" {
		c.JSON(400, gin.H{"error": "name required"})
		return
	}

	// 2. files
	imageFile, err := c.FormFile("image")
	if err != nil {
		c.JSON(400, gin.H{"error": "image required"})
		return
	}

	var imageURL string

	// 3. upload IMAGE
	imgSrc, err := imageFile.Open()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to open image"})
		return
	}
	defer func() {
		if err := imgSrc.Close(); err != nil {
			log.Println(err)
		}
	}()

	imgName := fmt.Sprintf("service_img_%d_%s", time.Now().UnixNano(), imageFile.Filename)
	ctx := context.Background()
	if err := storage.EnsurePublicBucket(ctx, "services"); err != nil {
		log.Println("failed to prepare services bucket:", err)
		c.JSON(500, gin.H{"error": "failed to prepare image storage", "details": err.Error()})
		return
	}

	_, err = storage.MinioClient.PutObject(
		ctx,
		"services",
		imgName,
		imgSrc,
		imageFile.Size,
		minio.PutObjectOptions{
			ContentType: imageFile.Header.Get("Content-Type"),
		},
	)

	if err != nil {
		log.Println("failed to upload service image:", err)
		c.JSON(500, gin.H{"error": "failed to upload image", "details": err.Error()})
		return
	}

	imageURL = "http://localhost:9000/services/" + imgName

	// 5. save to DB
	service := models.Service{
		Name:        name,
		Description: description,
		Status:      "active",
		ImageUrl:    imageURL,
		VideoUrl:    "",
	}

	if err := h.repo.CreateService(&service); err != nil {
		c.JSON(500, gin.H{"error": "db error"})
		return
	}
	// После создания услуги удаляем кэш списка услуг
	err = h.redis.Del(context.Background(), "services:all").Err()
	if err != nil {
		// Логируем ошибку инвалидации кэша
		logger.CacheError("services:all", err, "delete")
	} else {
		// Логируем успешную инвалидацию кэша
		logger.CacheInvalidate("services:all")
	}
	c.JSON(201, service)
}

// @Summary Update service
// @Security ApiKeyAuth
// @Description Обновление услуги (изменение name/description/image)
// @Tags services
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "Service ID"
// @Param name formData string false "Service name"
// @Param description formData string false "Description"
// @Param image formData file false "Service icon file"
// @Success 200 {object} models.Service
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/services/{id} [put]
func (h *Handler) UpdateService(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	name := c.PostForm("name")
	description := c.PostForm("description")

	var imageURL string
	// Попробуем получить файл, но не обязательно
	imageFile, err := c.FormFile("image")
	if err == nil {
		imgSrc, err := imageFile.Open()
		if err != nil {
			c.JSON(500, gin.H{"error": "failed to open image"})
			return
		}
		defer func() {
			if err := imgSrc.Close(); err != nil {
				log.Println(err)
			}
		}()

		imgName := fmt.Sprintf("service_img_%d_%s", time.Now().UnixNano(), imageFile.Filename)
		ctx := context.Background()
		if err := storage.EnsurePublicBucket(ctx, "services"); err != nil {
			log.Println("failed to prepare services bucket:", err)
			c.JSON(500, gin.H{"error": "failed to prepare image storage", "details": err.Error()})
			return
		}

		_, err = storage.MinioClient.PutObject(
			ctx,
			"services",
			imgName,
			imgSrc,
			imageFile.Size,
			minio.PutObjectOptions{ContentType: imageFile.Header.Get("Content-Type")},
		)

		if err != nil {
			log.Println("failed to upload service image:", err)
			c.JSON(500, gin.H{"error": "failed to upload image", "details": err.Error()})
			return
		}

		imageURL = "http://localhost:9000/services/" + imgName
	}

	updates := map[string]interface{}{}
	if name != "" {
		updates["name"] = name
	}
	if description != "" {
		updates["description"] = description
	}
	if imageURL != "" {
		updates["image_url"] = imageURL
	}

	if len(updates) == 0 {
		c.JSON(400, gin.H{"error": "no fields to update"})
		return
	}

	if err := h.repo.UpdateService(uint(id), updates); err != nil {
		c.JSON(500, gin.H{"error": "failed to update service"})
		return
	}

	// Инвалидация кэша
	ctx := context.Background()
	keyList := "services:all"
	keyItem := fmt.Sprintf("services:%d", id)
	if err := h.redis.Del(ctx, keyList).Err(); err != nil {
		logger.CacheError(keyList, err, "delete")
	} else {
		logger.CacheInvalidate(keyList)
	}
	if err := h.redis.Del(ctx, keyItem).Err(); err != nil {
		logger.CacheError(keyItem, err, "delete")
	} else {
		logger.CacheInvalidate(keyItem)
	}

	// Вернем обновленную запись
	service, err := h.repo.GetServiceByID(uint(id))
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch service after update"})
		return
	}

	c.JSON(200, service)
}

// @Summary Delete service
// @Security ApiKeyAuth
// @Description Удаление услуги (status = deleted)
// @Tags services
// @Param id path int true "Service ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/services/{id} [delete]
func (h *Handler) DeleteService(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	err = h.repo.DeleteService(uint(id))
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to delete service"})
		return
	}
	ctx := context.Background()

	// Ключ кэша списка активных услуг
	key1 := "services:all"
	// Удаляем кэш списка услуг
	err = h.redis.Del(ctx, key1).Err()
	if err != nil {
		// Логируем ошибку инвалидации списка
		logger.CacheError(key1, err, "delete")
	} else {
		// Логируем успешную инвалидацию списка
		logger.CacheInvalidate(key1)
	}

	// Ключ кэша удаленной услуги
	key2 := fmt.Sprintf("services:%d", id)
	// Удаляем кэш конкретной услуги
	err = h.redis.Del(ctx, key2).Err()
	if err != nil {
		// Логируем ошибку инвалидации услуги
		logger.CacheError(key2, err, "delete")
	} else {
		// Логируем успешную инвалидацию услуги
		logger.CacheInvalidate(key2)
	}
	c.JSON(200, gin.H{
		"message": "service deleted (soft delete)",
	})
}
