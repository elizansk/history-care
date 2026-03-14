package handler

import (
	"net/http"
	"strconv"

	"history-care-texnology/internal/app/repository"
	"history-care-texnology/internal/models"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Repository *repository.Repository
}

func NewHandler(r *repository.Repository) *Handler {
	return &Handler{Repository: r}
}

func (h *Handler) GetBuildings(ctx *gin.Context) {
	regionID, _ := strconv.Atoi(ctx.Query("region"))
	categoryID, _ := strconv.Atoi(ctx.Query("category"))

	buildings, _ := h.Repository.GetBuildings(uint(regionID), uint(categoryID))

	ctx.HTML(http.StatusOK, "buildings.html", gin.H{
		"buildings": buildings,
		"region":    regionID,
		"category":  categoryID,
	})
}

func (h *Handler) GetBuilding(ctx *gin.Context) {
	id, _ := strconv.Atoi(ctx.Param("id"))
	building, err := h.Repository.GetBuilding(uint(id))
	if err != nil {
		ctx.String(http.StatusNotFound, "not found")
		return
	}

	ctx.HTML(http.StatusOK, "building.html", gin.H{
		"building": building,
	})
}

func (h *Handler) GetDonate(ctx *gin.Context) {
	id, _ := strconv.Atoi(ctx.Param("id"))
	building, err := h.Repository.GetBuilding(uint(id))
	if err != nil {
		ctx.String(http.StatusNotFound, "not found")
		return
	}

	var order *models.ReconstructionOrder
	if len(building.ReconstructionOrders) > 0 {
		order = &building.ReconstructionOrders[0]
	} else {
		order = &models.ReconstructionOrder{
			TotalAmount:     0,
			CollectedAmount: 0,
		}
	}

	ctx.HTML(http.StatusOK, "donate.html", gin.H{
		"building":  building,
		"collected": order.CollectedAmount,
		"goal":      order.TotalAmount,
	})
}

func (h *Handler) PostDonate(ctx *gin.Context) {
	orderID, _ := strconv.Atoi(ctx.Param("id"))
	userID, _ := strconv.Atoi(ctx.PostForm("user_id"))
	amountStr := ctx.PostForm("amount")
	if amountStr == "other" {
		amountStr = ctx.PostForm("custom_amount")
	}
	amount, _ := strconv.ParseFloat(amountStr, 64)

	err := h.Repository.AddDonation(uint(orderID), uint(userID), amount)
	if err != nil {
		ctx.String(http.StatusInternalServerError, "cannot add donation")
		return
	}

	ctx.Redirect(http.StatusSeeOther, "/donate/"+ctx.Param("id"))
}

func (h *Handler) DeleteOrder(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.String(http.StatusBadRequest, "invalid order ID")
		return
	}

	if err := h.Repository.DeleteReconstructionOrder(uint(id)); err != nil {
		ctx.String(http.StatusInternalServerError, "failed to delete order")
		return
	}

	ctx.Redirect(http.StatusSeeOther, "/building/"+ctx.Query("building_id"))
}
