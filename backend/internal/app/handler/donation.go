package handler

import (
	"net/http"
	"strconv"

	"history-care-texnology/internal/models"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetDonate(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil || id < 0 {
		ctx.String(http.StatusBadRequest, "invalid building id")
		return
	}

	building, err := h.repo.GetBuilding(uint(id))
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

	uid := uint(userID)
	err := h.repo.AddDonation(uint(orderID), &uid, amount)
	if err != nil {
		ctx.String(http.StatusInternalServerError, "cannot add donation")
		return
	}

	ctx.Redirect(http.StatusSeeOther, "/donate/"+ctx.Param("id"))
}
