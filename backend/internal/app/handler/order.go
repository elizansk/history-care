package handler

import (
	"history-care-texnology/internal/models"
	"strconv"
	"time"
"log"
	"github.com/gin-gonic/gin"
)

type CreateDraftOrderRequest struct {
	BuildingID uint `json:"building_id"`
}

type AddServiceToDraftRequest struct {
	ServiceID   uint    `json:"service_id"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
}
type UpdateOrderRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Address     string `json:"address"`
	CategoryID  uint   `json:"category_id"`
	CityID      uint   `json:"city_id"`
}

type UpdateServiceInDraftRequest struct {
	Price       float64 `json:"price"`
	Description string  `json:"description"`
}

// @Summary      Get donatable orders
// @Description  список заявок с фильтрацией (только заявки formed и connelction started)
// @Tags         base_orders
// @Produce      json
// @Param        categoryId query int false "Category Id"
// @Param        cityId query int false "City Id"
// @Param        from query string false "date from (YYYY-MM-DD)"
// @Param        to query string false "date to (YYYY-MM-DD)"
// @Success      200 {array} models.ReconstructionOrder
// @Failure      401 {object} map[string]string
// @Failure      403 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /api/orders/formed [get]
func (h *Handler) GetDonatableOrders(c *gin.Context) {

	var from, to *time.Time
	var categoryId, cityId uint

	if c.Query("from") != "" {
		t, _ := time.Parse("2006-01-02", c.Query("from"))
		from = &t
	}

	if c.Query("to") != "" {
		t, _ := time.Parse("2006-01-02", c.Query("to"))
		to = &t
	}

	if v := c.Query("cityId"); v != "" {
		if id, err := strconv.Atoi(v); err == nil {
			cityId = uint(id)
		}
	}

	if v := c.Query("categoryId"); v != "" {
		if id, err := strconv.Atoi(v); err == nil {
			categoryId = uint(id)
		}
	}

	data, err := h.repo.GetDonatableOrders(categoryId, cityId, from, to)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, data)
}

// @Summary      Get orders
// @Security     ApiKeyAuth
// @Description  список заявок с фильтрацией (доступ ограничен ролями)
// @Tags         orders
// @Produce      json
// @Param        status query string false "status (formed/ finished)"
// @Param        from query string false "date from (YYYY-MM-DD)"
// @Param        to query string false "date to (YYYY-MM-DD)"
// @Success      200 {array} models.ReconstructionOrder
// @Failure      401 {object} map[string]string
// @Failure      403 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /api/orders [get]
func (h *Handler) GetOrders(c *gin.Context) {

	role := c.GetString("role")
	userID := c.GetUint("user_id")

	status := c.Query("status")

	var from, to *time.Time

	if c.Query("from") != "" {
		t, _ := time.Parse("2006-01-02", c.Query("from"))
		from = &t
	}

	if c.Query("to") != "" {
		t, _ := time.Parse("2006-01-02", c.Query("to"))
		to = &t
	}

	data, err := h.repo.GetOrders(status, from, to)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	if role != "Admin" {
		filtered := make([]models.ReconstructionOrder, 0)

		for _, o := range data {
			if o.CreatorID == userID {
				filtered = append(filtered, o)
			}
		}

		c.JSON(200, filtered)
		return
	}

	c.JSON(200, data)
}

// @Summary      Get order by ID

// @Description  Получение заявки (только владелец)
// @Tags         orders
// @Produce      json
// @Param        id path int true "Order ID"
// @Success      200 {object} models.ReconstructionOrder
// @Failure      403 {object} map[string]string
// @Failure      404 {object} map[string]string
// @Router       /api/orders/{id} [get]
func (h *Handler) GetOrderByID(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	id, _ := strconv.Atoi(c.Param("id"))

	order, err := h.repo.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}
	if role != "Admin" {
		orderNotDonation := order.Status != "formed" && order.Status != "collection_started"
		if order.CreatorID != userID && orderNotDonation {
			c.JSON(403, gin.H{"error": "forbidden"})
			return
		}
	}

	c.JSON(200, order)
}

// @Summary      Get draft order (cart)
// @Security     ApiKeyAuth
// @Description  Возвращает текущую черновую заявку пользователя (корзину). Если черновика нет — создаёт новый.
// @Tags         orders
// @Produce      json
// @Success      200 {object} object{order_id=uint,count=int} "Draft order info"
// @Failure      401 {object} map[string]string "Unauthorized"
// @Failure      500 {object} map[string]string "Internal server error"
// @Router       /api/orders/draft [get]
func (h *Handler) GetDraftOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	order, err := h.repo.GetDraftOrder(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, gin.H{
		"order_id":   order.ID,
		"buildingId": order.BuildingID,
	})
}

// @Summary Create draft order
// @Security ApiKeyAuth
// @Tags orders
// @Accept json
// @Produce json
// @Param CreateDraftOrderRequest body CreateDraftOrderRequest true "Building id"
// @Success 201 {object} models.ReconstructionOrder
// @Failure 400 {object} map[string]string
// @Router /api/orders/draft [post]
func (h *Handler) CreateDraftOrder(c *gin.Context) {

	userID := c.GetUint("user_id")

	var req CreateDraftOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil || req.BuildingID == 0 {
		c.JSON(400, gin.H{"error": "building_id required"})
		return
	}

	existingDraft, err := h.repo.GetDraftOrder(userID)
	if err == nil && existingDraft.ID != 0 {
		c.JSON(400, gin.H{"error": "draft already exists"})
		return
	}

	used, err := h.repo.IsBuildingAlreadyUsed(req.BuildingID)
	if err != nil {
		c.JSON(500, gin.H{"error": "db error"})
		return
	}
	if used {
		c.JSON(400, gin.H{"error": "building already attached to order"})
		return
	}
	_, err = h.repo.GetBuilding(req.BuildingID)
	if err != nil {
		c.JSON(400, gin.H{"error": "building not found"})
		return
	}

	order, err := h.repo.CreateDraftOrder(userID, req.BuildingID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to create draft"})
		return
	}

	c.JSON(201, order)
}

// @Summary      Delete order
// @Security     ApiKeyAuth
// @Description  Логическое удаление заявки (только владелец)
// @Tags         orders
// @Produce      json
// @Param        id path int true "Order ID"
// @Success      200 {object} map[string]string
// @Failure      403 {object} map[string]string
// @Failure      404 {object} map[string]string
// @Router       /api/orders/{id} [delete]
func (h *Handler) DeleteOrder(c *gin.Context) {

	userID := c.GetUint("user_id")
	role := c.GetString("role")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid order ID"})
		return
	}

	order, err := h.repo.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}

	if role != "Admin" {
		if order.CreatorID != userID {
			c.JSON(403, gin.H{"error": "forbidden"})
			return
		}
	}

	if err := h.repo.DeleteOrder(uint(id)); err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, gin.H{"status": "deleted"})
}

// @Summary Update order fields
// @Security ApiKeyAuth
// @Description Редактирование заявки (только если draft)
// @Tags orders
// @Accept json
// @Produce json
// @Param id path int true "Order ID"
// @Param UpdateOrderRequest body UpdateOrderRequest true "building fields"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /api/orders/{id} [put]
func (h *Handler) UpdateOrder(c *gin.Context) {

	userID := c.GetUint("user_id")
	role := c.GetString("role")

	id, _ := strconv.Atoi(c.Param("id"))

	var req UpdateOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "bad request"})
		return
	}

	order, err := h.repo.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": "order not found"})
		return
	}

	// доступ
	if role != "Admin" && order.CreatorID != userID {
		c.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	// менять можно только draft
	if order.Status != "draft" {
		c.JSON(400, gin.H{"error": "order is not editable"})
		return
	}

	user, err := h.repo.GetUserByID(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "user not found"})
		return
	}

	var cityID uint

	if role != "Admin" {
		if user.CityID == nil {
			c.JSON(400, gin.H{"error": "user has no city"})
			return
		}
		cityID = *user.CityID
	} else {
		cityID = req.CityID
	}
	building, err := h.repo.GetBuildingByID(order.BuildingID)
	if err != nil {
		c.JSON(404, gin.H{"error": "building not found"})
		return
	}
	err = h.repo.UpdateBuildingByID(
		building.ID,
		req.Name,
		req.Description,
		req.Address,
		req.CategoryID,
		cityID,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "update failed"})
		return
	}

	c.JSON(200, gin.H{"status": "updated"})
}

// @Summary Form order
// @Security ApiKeyAuth
// @Description Формирование заявки (расчет суммы)
// @Tags orders
// @Param id path int true "Order ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /api/orders/{id}/form [put]
func (h *Handler) FormOrder(c *gin.Context) {

	userID := c.GetUint("user_id")

	id, _ := strconv.Atoi(c.Param("id"))

	order, err := h.repo.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}

	// только владелец
	if order.CreatorID != userID {
		c.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	// только draft
	if order.Status != "draft" {
		c.JSON(400, gin.H{"error": "already formed"})
		return
	}

	// проверка обязательных полей
	if len(order.Services) == 0 {
		c.JSON(400, gin.H{"error": "no services"})
		return
	}

	// расчет суммы (lab logic)
	var total float64
	for _, s := range order.Services {
		total += s.Price
	}

	err = h.repo.FormOrder(uint(id), total)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, gin.H{
		"status": "formed",
		"total":  total,
	})
}

// @Summary Finish order (admin)
// @Security ApiKeyAuth
// @Description Завершение или отклонение заявки
// @Tags orders
// @Param id path int true "Order ID"
// @Param status query string true "finish or reject"
// @Success 200 {object} map[string]string
// @Router /api/orders/{id}/moderate [put]
func (h *Handler) ModerateOrder(c *gin.Context) {

	role := c.GetString("role")
	userID := c.GetUint("user_id")

	if role != "Admin" {
		c.JSON(403, gin.H{"error": "only admin"})
		return
	}

	id, _ := strconv.Atoi(c.Param("id"))
	status := c.Query("status") // finished / rejected

	if status != "finished" && status != "rejected" {
		c.JSON(400, gin.H{"error": "bad request"})
	}
	order, err := h.repo.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}

	if order.Status != "formed" {
		c.JSON(400, gin.H{"error": "must be formed"})
		return
	}

	err = h.repo.FinishOrder(uint(id), status, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, gin.H{"status": status})
}

// @Summary Add service to draft order
// @Security ApiKeyAuth
// @Description Добавляет услугу в заявку-черновик
// @Tags orders-services
// @Accept json
// @Produce json
// @Param AddServiceToDraftRequest body AddServiceToDraftRequest true "service_id + price"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/orders/services [post]
func (h *Handler) AddServiceToDraft(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req AddServiceToDraftRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "bad request"})
		return
	}

	order, err := h.repo.GetDraftOrder(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "draft error"})
		return
	}

	// проверка существования услуги
	_, err = h.repo.GetServiceByID(req.ServiceID)
	if err != nil {
		c.JSON(404, gin.H{"error": "service not found"})
		return
	}

	// защита от дублей
	exists, err := h.repo.CheckServiceInOrder(order.ID, req.ServiceID)
	if err != nil {
		c.JSON(500, gin.H{"error": "check service failed"})
		return
	}
	if exists {
		c.JSON(400, gin.H{"error": "already added"})
		return
	}

	err = h.repo.AddOrderService(order.ID, req.ServiceID, req.Price, req.Description)
	if err != nil {
		c.JSON(500, gin.H{"error": "add failed"})
		return
	}

	// пересчёт total
if err := h.repo.RecalculateOrderTotal(order.ID); err != nil {
    log.Println(err)
}

	c.JSON(200, gin.H{"status": "added"})
}

// @Summary Update service price in draft
// @Security ApiKeyAuth
// @Description Изменяет стоимость услуги в заявке
// @Tags orders-services
// @Accept json
// @Produce json
// @Param service_id path int true "Service ID"
// @Param UpdateServiceInDraftRequest body UpdateServiceInDraftRequest true "price and description"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/orders/services/{service_id} [put]
func (h *Handler) UpdateServiceInDraft(c *gin.Context) {
	userID := c.GetUint("user_id")
	serviceID, _ := strconv.Atoi(c.Param("service_id"))

	var req UpdateServiceInDraftRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "bad request"})
		return
	}

	order, err := h.repo.GetDraftOrder(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "draft error"})
		return
	}

	err = h.repo.UpdateOrderService(order.ID, uint(serviceID), req.Price, req.Description)
	if err != nil {
		c.JSON(500, gin.H{"error": "update failed"})
		return
	}

if err := h.repo.RecalculateOrderTotal(order.ID); err != nil {
    log.Println(err)
}

	c.JSON(200, gin.H{"status": "updated"})
}

// @Summary Delete service from draft
// @Security ApiKeyAuth
// @Description Удаляет услугу из заявки-черновика
// @Tags orders-services
// @Produce json
// @Param service_id path int true "Service ID"
// @Success 200 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/orders/services/{service_id} [delete]
func (h *Handler) DeleteServiceFromDraft(c *gin.Context) {
	userID := c.GetUint("user_id")
	serviceID, _ := strconv.Atoi(c.Param("service_id"))

	order, err := h.repo.GetDraftOrder(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "draft error"})
		return
	}

	err = h.repo.DeleteOrderService(order.ID, uint(serviceID))
	if err != nil {
		c.JSON(500, gin.H{"error": "delete failed"})
		return
	}

if err := h.repo.RecalculateOrderTotal(order.ID); err != nil {
    log.Println(err)
}

	c.JSON(200, gin.H{"status": "deleted"})
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
//func (h *Handler) CreateOrder(c *gin.Context) {
//
//	userIDValue, exists := c.Get("user_id")
//	if !exists {
//		c.JSON(401, gin.H{"error": "unauthorized"})
//		return
//	}
//	userID, ok := userIDValue.(uint)
//	if !ok {
//		c.JSON(500, gin.H{"error": "invalid user_id type"})
//		return
//	}
//	user, err := h.repo.GetUserByID(userID)
//	if err != nil {
//		c.JSON(500, gin.H{"error": "user not found"})
//		return
//	}
//
//	if user.CityID == nil {
//		c.JSON(400, gin.H{"error": "user has no city"})
//		return
//	}
//	name := c.PostForm("name")
//	description := c.PostForm("description")
//	address := c.PostForm("address")
//
//	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
//	serviceIDs := c.PostFormArray("service_ids")
//	quantities := c.PostFormArray("quantities")
//
//	// 1. здание
//	building := models.Building{
//		Name:        name,
//		Description: description,
//		Address:     address,
//		CategoryID:  uint(categoryID),
//		CityID:      *user.CityID,
//	}
//
//	if err := h.repo.CreateBuilding(&building); err != nil {
//		c.JSON(500, gin.H{"error": "building error"})
//		return
//	}
//
//	// 2. заявка
//	order := models.ReconstructionOrder{
//		BuildingID: building.ID,
//		CreatorID:  userID,
//		Status:     "draft",
//	}
//
//	if err := h.repo.CreateOrder(&order); err != nil {
//		c.JSON(500, gin.H{"error": "order error"})
//		return
//	}
//
//	// 3. услуги
//	var orderServices []models.OrderService
//	var total float64
//
//	for i, sID := range serviceIDs {
//		id, _ := strconv.Atoi(sID)
//		qty, _ := strconv.Atoi(quantities[i])
//
//		service, err := h.repo.GetServiceByID(uint(id))
//		if err != nil {
//			continue
//		}
//
//		result := service.Price * float64(qty)
//		total += result
//
//		orderServices = append(orderServices, models.OrderService{
//			OrderID:   order.ID,
//			ServiceID: service.ID,
//			Price:     service.Price,
//			Quantity:  qty,
//			Result:    result,
//		})
//	}
//
//	if len(orderServices) > 0 {
//		if err := h.repo.AddServices(orderServices); err != nil {
//			log.Println("AddServices error:", err)
//		}
//	}
//
//	if err := h.repo.UpdateOrderTotal(order.ID, total); err != nil {
//		log.Println("UpdateOrderTotal error:", err)
//	}
//
//	// 4. файлы
//	form, err := c.MultipartForm()
//	if err != nil {
//		log.Println("Multipart error:", err)
//		c.JSON(400, gin.H{"error": "no multipart"})
//		return
//	}
//
//	files := form.File["files"]
//
//	if len(files) == 0 {
//		log.Println("NO FILES RECEIVED")
//		c.JSON(400, gin.H{"error": "no files"})
//		return
//	}
//
//	if storage.MinioClient == nil {
//		log.Println("MINIO CLIENT IS NIL")
//		c.JSON(500, gin.H{"error": "minio not initialized"})
//		return
//	}
//
//	var resources []models.BuildingResource
//
//	for _, file := range files {
//		log.Println("FILE RECEIVED:", file.Filename)
//
//		src, err := file.Open()
//		if err != nil {
//			log.Println("OPEN ERROR:", err)
//			continue
//		}
//
//		objectName := fmt.Sprintf("building_%d_%s", building.ID, file.Filename)
//		log.Println("UPLOADING:", objectName)
//
//		_, err = storage.MinioClient.PutObject(
//			context.Background(),
//			"buildings",
//			objectName,
//			src,
//			file.Size,
//			minio.PutObjectOptions{
//				ContentType: file.Header.Get("Content-Type"),
//			},
//		)
//
//		src.Close() // ← ВАЖНО: закрываем тут, не defer
//
//		if err != nil {
//			log.Println("MinIO upload error:", err)
//			continue
//		}
//
//		url := "http://localhost:9000/buildings/" + objectName
//
//		resources = append(resources, models.BuildingResource{
//			BuildingID:   building.ID,
//			ResourceType: "photo",
//			URL:          url,
//		})
//	}
//
//	if len(resources) > 0 {
//		if err := h.repo.AddResources(resources); err != nil {
//			log.Println("AddResources error:", err)
//		}
//	}
//
//	c.JSON(200, gin.H{
//		"order_id": order.ID,
//	})
//}
