package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

//func (h *Handler) GetDonate(ctx *gin.Context) {
//	id, err := strconv.Atoi(ctx.Param("id"))
//	if err != nil || id < 0 {
//		ctx.String(http.StatusBadRequest, "invalid building id")
//		return
//	}
//
//	building, err := h.repo.GetBuilding(uint(id))
//	if err != nil {
//		ctx.String(http.StatusNotFound, "not found")
//		return
//	}
//
//	var order *models.ReconstructionOrder
//	if len(building.ReconstructionOrders) > 0 {
//		order = &building.ReconstructionOrders[0]
//	} else {
//		order = &models.ReconstructionOrder{
//			TotalAmount:     0,
//			CollectedAmount: 0,
//		}
//	}
//	ctx.JSON(200, data)
//	ctx.HTML(http.StatusOK, "donate.html", gin.H{
//		"building":  building,
//		"collected": order.CollectedAmount,
//		"goal":      order.TotalAmount,
//	})
//}

// @Summary      Post a donation
// @Security ApiKeyAuth
// @Description  Добавляет пожертвование на заявку
// @Tags         donation
// @Accept       application/x-www-form-urlencoded
// @Produce      html
// @Param        id path int true "Order ID"
// @Param        user_id formData int true "User ID"
// @Param        amount formData string true "Amount or 'other'"
// @Param        custom_amount formData string false "Custom amount if 'other'"
// @Success      200 {object} map[string]interface{}
// @Failure      500 {object} map[string]string
// @Router       /donate/{id} [post]
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
