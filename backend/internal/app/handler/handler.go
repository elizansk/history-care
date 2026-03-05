package handler

import (
	"net/http"
	"strconv"

	"history-care/internal/app/repository"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Repository *repository.Repository
}

func NewHandler(r *repository.Repository) *Handler {
	return &Handler{Repository: r}
}

func (h *Handler) GetBuildings(ctx *gin.Context) {
	region := ctx.Query("region")
	category := ctx.Query("category")
	objType := ctx.Query("type")

	buildings, _ := h.Repository.GetBuildings(region, category, objType)

	ctx.HTML(http.StatusOK, "buildings.html", gin.H{
		"buildings": buildings,
		"region":    region,
		"category":  category,
		"type":      objType,
	})
}

func (h *Handler) GetBuilding(ctx *gin.Context) {
	id, _ := strconv.Atoi(ctx.Param("id"))
	building, err := h.Repository.GetBuilding(id)
	if err != nil {
		ctx.String(404, "not found")
		return
	}

	ctx.HTML(http.StatusOK, "building.html", gin.H{
		"building": building,
	})
}

func (h *Handler) GetDonate(ctx *gin.Context) {
	id, _ := strconv.Atoi(ctx.Param("id"))
	building, _ := h.Repository.GetBuilding(id)

	ctx.HTML(http.StatusOK, "donate.html", gin.H{
		"building": building,
	})
}
