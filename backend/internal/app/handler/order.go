package handler

import (
	"errors"
	"history-care-texnology/internal/models"
	"log"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateDraftOrderRequest struct {
	BuildingID  uint    `json:"building_id"`
	TotalAmount float64 `json:"total_amount"`
	Description string  `json:"description"`
}

type AddServiceToDraftRequest struct {
	ServiceID   uint    `json:"service_id"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
}

type BulkAddServicesRequest struct {
	Services []struct {
		ServiceID   uint    `json:"service_id"`
		Quantity    int     `json:"quantity"`
		Price       float64 `json:"price"`
		Description string  `json:"description"`
	} `json:"services"`
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
		t = t.AddDate(0, 0, 1)
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
		t = t.AddDate(0, 0, 1)
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
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "draft not found"})
			return
		}
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, order)
}

// @Summary Create draft order
// @Security ApiKeyAuth
// @Tags orders
// @Accept json
// @Produce json
// @Param CreateDraftOrderRequest body CreateDraftOrderRequest true "Building id and order details"
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
		if existingDraft.BuildingID == req.BuildingID {
			c.JSON(200, existingDraft)
			return
		}
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
	role := c.GetString("role")

	id, _ := strconv.Atoi(c.Param("id"))

	order, err := h.repo.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}

	// только владелец
	if role != "Admin" && order.CreatorID != userID {
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

// @Summary Moderate order (admin)
// @Security ApiKeyAuth
// @Description Смена статуса заявки администратором
// @Tags orders
// @Param id path int true "Order ID"
// @Param status query string true "draft or rejected"
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
	status := c.Query("status") // draft / rejected

	if status != "rejected" && status != "draft" {
		c.JSON(400, gin.H{"error": "bad request"})
		return
	}
	order, err := h.repo.GetOrderByID(uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}

	allowed := false
	switch order.Status {
	case "draft":
		allowed = status == "rejected"
	case "formed":
		allowed = status == "rejected" || status == "draft"
	case "rejected":
		allowed = status == "rejected"
	}

	if !allowed {
		c.JSON(400, gin.H{"error": "status transition is not allowed"})
		return
	}

	err = h.repo.ModerateOrder(uint(id), status, userID)
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

// @Summary Add multiple services to draft order
// @Security ApiKeyAuth
// @Description Добавляет несколько услуг к заявке (массовое добавление)
// @Tags orders-services
// @Accept json
// @Produce json
// @Param id path int true "Order ID"
// @Param BulkAddServicesRequest body BulkAddServicesRequest true "Services with quantities and descriptions"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/orders/{id}/services [post]
func (h *Handler) BulkAddServicesToOrder(c *gin.Context) {
	userID := c.GetUint("user_id")
	orderID, _ := strconv.Atoi(c.Param("id"))

	// Verify order belongs to user
	order, err := h.repo.GetOrderByID(uint(orderID))
	if err != nil {
		c.JSON(404, gin.H{"error": "order not found"})
		return
	}

	if order.CreatorID != userID {
		c.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	var req BulkAddServicesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "bad request"})
		return
	}

	if len(req.Services) == 0 {
		c.JSON(400, gin.H{"error": "no services provided"})
		return
	}

	for _, svc := range req.Services {
		exists, err := h.repo.CheckServiceInOrder(uint(orderID), svc.ServiceID)
		if err != nil {
			log.Println("failed to check existing service:", err)
			continue
		}

		if exists {
			err = h.repo.UpdateOrderService(uint(orderID), svc.ServiceID, svc.Price, svc.Description)
			if err != nil {
				log.Println("failed to update existing service:", err)
			}
			continue
		}

		err = h.repo.AddOrderService(uint(orderID), svc.ServiceID, svc.Price, svc.Description)
		if err != nil {
			log.Println("failed to add service:", err)
		}
	}

	// Проверяет ош
	// Recalculate total
	if err := h.repo.RecalculateOrderTotal(uint(orderID)); err != nil {
		log.Println("failed to recalculate total:", err)
	}

	c.JSON(200, gin.H{"status": "services added"})
}

// @Summary Create final order from draft
// @Security ApiKeyAuth
// @Description Завершает черновую заявку и создает финальный заказ
// @Tags orders
// @Accept json
// @Produce json
// @Param order_id body object{order_id=int} true "Draft order ID"
// @Success 201 {object} models.ReconstructionOrder
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/orders [post]
func (h *Handler) FinalizeOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OrderID uint `json:"order_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil || req.OrderID == 0 {
		c.JSON(400, gin.H{"error": "order_id required"})
		return
	}

	// Get order
	order, err := h.repo.GetOrderByID(req.OrderID)
	if err != nil {
		c.JSON(404, gin.H{"error": "order not found"})
		return
	}

	// Verify ownership
	if order.CreatorID != userID {
		c.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	// Verify draft status
	if order.Status != "draft" {
		c.JSON(400, gin.H{"error": "order is not in draft status"})
		return
	}

	// Update status to formed
	err = h.repo.UpdateOrderStatus(req.OrderID, "formed")
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to finalize order"})
		return
	}

	updated, _ := h.repo.GetOrderByID(req.OrderID)
	c.JSON(201, updated)
}
