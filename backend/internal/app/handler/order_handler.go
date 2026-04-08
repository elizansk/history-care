package handler

import (
	"log"
	"strconv"

	"history-care-texnology/internal/app/repository"
	"history-care-texnology/internal/models"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	repo *repository.OrderRepository
}

func NewOrderHandler(repo *repository.OrderRepository) *OrderHandler {
	return &OrderHandler{repo: repo}
}

// ===== СПРАВОЧНИКИ =====
func (h *OrderHandler) GetServices(c *gin.Context) {
	data, err := h.repo.GetServices()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}
	c.JSON(200, data)
}

func (h *OrderHandler) GetCategories(c *gin.Context) {
	data, err := h.repo.GetCategories()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}
	c.JSON(200, data)
}

func (h *OrderHandler) GetRegions(c *gin.Context) {
	data, err := h.repo.GetRegions()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}
	c.JSON(200, data)
}

// СОЗДАНИЕ ЗАЯВКИ
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	// ВРЕМЕННО без auth
	userID := uint(1)

	name := c.PostForm("name")
	description := c.PostForm("description")
	address := c.PostForm("address")

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	regionID, _ := strconv.Atoi(c.PostForm("region_id"))

	serviceIDs := c.PostFormArray("service_ids")
	quantities := c.PostFormArray("quantities")

	// 1. здание
	building := models.Building{
		Name:        name,
		Description: description,
		Address:     address,
		CategoryID:  uint(categoryID),
		RegionID:    uint(regionID),
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
	form, _ := c.MultipartForm()
	files := form.File["files"]

	var resources []models.BuildingResource

	for _, file := range files {
		url := "/uploads/" + file.Filename

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
