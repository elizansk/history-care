package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

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
