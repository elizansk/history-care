package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetBuildings(ctx *gin.Context) {
	regionID, err := strconv.Atoi(ctx.Query("region"))
	if err != nil || regionID < 0 {
		ctx.String(http.StatusBadRequest, "invalid region")
		return
	}

	categoryID, err := strconv.Atoi(ctx.Query("category"))
	if err != nil || categoryID < 0 {
		ctx.String(http.StatusBadRequest, "invalid category")
		return
	}

	buildings, _ := h.repo.GetBuildings(uint(regionID), uint(categoryID))

	ctx.HTML(http.StatusOK, "buildings.html", gin.H{
		"buildings": buildings,
		"region":    regionID,
		"category":  categoryID,
	})
}

func (h *Handler) GetBuilding(ctx *gin.Context) {
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

	ctx.HTML(http.StatusOK, "building.html", gin.H{
		"building": building,
	})
}
