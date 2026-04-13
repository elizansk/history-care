package handler

import (
	"context"
	"fmt"
	"history-care-texnology/internal/models"
	"history-care-texnology/internal/storage"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

// @Summary      Delete an order
// @Security ApiKeyAuth
// @Description  Удаляет заявку по ID
// @Tags         order
// @Produce      html
// @Param        id path int true "Order ID"
// @Success      303 {string} string "Redirect to /building/{building_id}"
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /order/delete/{id} [post]
func (h *Handler) DeleteOrder(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.String(http.StatusBadRequest, "invalid order ID")
		return
	}

	if err := h.repo.DeleteReconstructionOrder(uint(id)); err != nil {
		ctx.String(http.StatusInternalServerError, "failed to delete order")
		return
	}

	ctx.Redirect(http.StatusSeeOther, "/building/"+ctx.Query("building_id"))
}

// @Summary      Get all services
// @Security ApiKeyAuth
// @Description  Возвращает список всех услуг
// @Tags         services
// @Produce      json
// @Success      200 {array} models.BuildingService
// @Failure      500 {object} map[string]string
// @Router       /api/services [get]
func (h *Handler) GetServices(c *gin.Context) {
	data, err := h.repo.GetServices()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}
	c.JSON(200, data)
}

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

// @Summary      Create a new order
// @Security ApiKeyAuth
// @Description  Создает новую заявку с услугами и файлами
// @Tags         order
// @Accept       multipart/form-data
// @Produce      json
// @Param        name formData string false "Building name"
// @Param        description formData string false "Description"
// @Param        address formData string false "Address"
// @Param        category_id formData int false "Category ID"
// @Param        service_ids formData []int false "IDs of services"
// @Param        quantities formData []int false "Quantities of services"
// @Param        files formData []file false "Files"
// @Param main_photo_index formData int false "Index of main photo"
// @Param main_video_index formData int false "Index of main video"
// @Success      200 {object} map[string]interface{}
// @Failure      500 {object} map[string]string
// @Router       /api/orders [post]
func (h *Handler) CreateOrder(c *gin.Context) {

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}
	userID, ok := userIDValue.(uint)
	if !ok {
		c.JSON(500, gin.H{"error": "invalid user_id type"})
		return
	}
	user, err := h.repo.GetUserByID(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "user not found"})
		return
	}

	if user.CityID == nil {
		c.JSON(400, gin.H{"error": "user has no city"})
		return
	}
	name := c.PostForm("name")
	description := c.PostForm("description")
	address := c.PostForm("address")

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	serviceIDs := c.PostFormArray("service_ids")
	quantities := c.PostFormArray("quantities")

	// 1. здание
	building := models.Building{
		Name:        name,
		Description: description,
		Address:     address,
		CategoryID:  uint(categoryID),
		CityID:      *user.CityID,
	}

	if err := h.repo.CreateBuilding(&building); err != nil {
		c.JSON(500, gin.H{"error": "building error"})
		return
	}

	// 2. заявка
	order := models.ReconstructionOrder{
		BuildingID: building.ID,
		CreatorID:  userID,
		Status:     "draft",
	}

	if err := h.repo.CreateOrder(&order); err != nil {
		c.JSON(500, gin.H{"error": "order error"})
		return
	}

	// 3. услуги
	var orderServices []models.OrderService
	var total float64

	for i, sID := range serviceIDs {
		id, _ := strconv.Atoi(sID)
		qty, _ := strconv.Atoi(quantities[i])

		service, err := h.repo.GetServiceByID(uint(id))
		if err != nil {
			continue
		}

		result := service.Price * float64(qty)
		total += result

		orderServices = append(orderServices, models.OrderService{
			OrderID:   order.ID,
			ServiceID: service.ID,
			Price:     service.Price,
			Quantity:  qty,
			Result:    result,
		})
	}

	if len(orderServices) > 0 {
		if err := h.repo.AddServices(orderServices); err != nil {
			log.Println("AddServices error:", err)
		}
	}

	if err := h.repo.UpdateOrderTotal(order.ID, total); err != nil {
		log.Println("UpdateOrderTotal error:", err)
	}

	// 4. файлы
	form, err := c.MultipartForm()
	if err != nil {
		log.Println("Multipart error:", err)
		c.JSON(400, gin.H{"error": "no multipart"})
		return
	}

	files := form.File["files"]

	if len(files) == 0 {
		log.Println("NO FILES RECEIVED")
		c.JSON(400, gin.H{"error": "no files"})
		return
	}

	if storage.MinioClient == nil {
		log.Println("MINIO CLIENT IS NIL")
		c.JSON(500, gin.H{"error": "minio not initialized"})
		return
	}

	var resources []models.BuildingResource

	for _, file := range files {
		log.Println("FILE RECEIVED:", file.Filename)

		src, err := file.Open()
		if err != nil {
			log.Println("OPEN ERROR:", err)
			continue
		}

		objectName := fmt.Sprintf("building_%d_%s", building.ID, file.Filename)
		log.Println("UPLOADING:", objectName)

		_, err = storage.MinioClient.PutObject(
			context.Background(),
			"buildings",
			objectName,
			src,
			file.Size,
			minio.PutObjectOptions{
				ContentType: file.Header.Get("Content-Type"),
			},
		)

		src.Close() // ← ВАЖНО: закрываем тут, не defer

		if err != nil {
			log.Println("MinIO upload error:", err)
			continue
		}

		url := "http://localhost:9000/buildings/" + objectName

		resources = append(resources, models.BuildingResource{
			BuildingID:   building.ID,
			ResourceType: "photo",
			URL:          url,
		})
	}

	if len(resources) > 0 {
		if err := h.repo.AddResources(resources); err != nil {
			log.Println("AddResources error:", err)
		}
	}

	c.JSON(200, gin.H{
		"order_id": order.ID,
	})
}
