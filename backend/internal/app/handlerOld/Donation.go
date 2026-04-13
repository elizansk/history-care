package handlerOld

import (
	"history-care-texnology/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *HandlerOld) GetDonate(ctx *gin.Context) {
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
