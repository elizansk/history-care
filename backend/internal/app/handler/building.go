package handler

import (
	"context"
	"fmt"
	"history-care-texnology/internal/models"
	"history-care-texnology/internal/storage"
	"strconv"
	"strings"
	"time"
    "log"
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

// @Summary Create building
// @Security ApiKeyAuth
// @Tags buildings
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "Building name"
// @Param description formData string false "Description"
// @Param address formData string true "Address"
// @Param category_id formData int true "Category ID"
// @Param city_id formData int false "City ID (only for admin)"
// @Param files formData []file true "Photos + Videos"
// @Success 201 {object} models.Building
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/buildings [post]
func (h *Handler) CreateBuilding(c *gin.Context) {

	//  1. user из middleware
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	//  2. form
	name := c.PostForm("name")
	description := c.PostForm("description")
	address := c.PostForm("address")

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	cityIDParam := c.PostForm("city_id")

	if name == "" || address == "" || categoryID == 0 {
		c.JSON(400, gin.H{"error": "missing required fields"})
		return
	}

	//3. определяем city
	var cityID uint

	if role == "City" {
		user, err := h.repo.GetUserByID(userID)
		if err != nil || user.CityID == nil {
			c.JSON(400, gin.H{"error": "user city not found"})
			return
		}
		cityID = *user.CityID

	} else if role == "Admin" {
		id, _ := strconv.Atoi(cityIDParam)
		if id == 0 {
			c.JSON(400, gin.H{"error": "city_id required for admin"})
			return
		}
		cityID = uint(id)
	} else {
		c.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	//  4. создаём здание
	building := models.Building{
		Name:        name,
		Description: description,
		Address:     address,
		CategoryID:  uint(categoryID),
		CityID:      cityID,
	}

	if err := h.repo.CreateBuilding(&building); err != nil {
		c.JSON(500, gin.H{"error": "failed to create building"})
		return
	}

	//  5. файлы
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(400, gin.H{"error": "multipart error"})
		return
	}

	files := form.File["files"]

	var resources []models.BuildingResource

	hasMainPhoto := false
	hasMainVideo := false

	for _, file := range files {

		src, err := file.Open()
		if err != nil {
			continue
		}
	defer func() {
        if err := src.Close(); err != nil {
            log.Println(err)
        }
    }()

		objectName := fmt.Sprintf("building_%d_%s", time.Now().UnixNano(), file.Filename)

		_, err = storage.MinioClient.PutObject(
			context.Background(),
			"buildings",
			objectName,
			src,
			file.Size,
			minio.PutObjectOptions{
				ContentType: file.Header.Get("Content-Type"),
			},
		)
		if err != nil {
			continue
		}

		url := "http://localhost:9000/buildings/" + objectName

		contentType := file.Header.Get("Content-Type")

		var resourceType string
		if strings.HasPrefix(contentType, "image/") {
			resourceType = "photo"
		} else if strings.HasPrefix(contentType, "video/") {
			resourceType = "video"
		} else {
			c.JSON(400, gin.H{
				"error": "only image and video files are allowed",
			})
			return
		}
		isMain := false

		if resourceType == "photo" && !hasMainPhoto {
			isMain = true
			hasMainPhoto = true
		}

		if resourceType == "video" && !hasMainVideo {
			isMain = true
			hasMainVideo = true
		}

		resources = append(resources, models.BuildingResource{
			BuildingID:   building.ID,
			ResourceType: resourceType,
			URL:          url,
			IsMain:       isMain,
		})
	}

	//  6. сохраняем ресурсы
	if len(resources) > 0 {
		if err := h.repo.CreateBuildingResources(resources); err != nil {
			c.JSON(500, gin.H{"error": "failed to save resources"})
			return
		}
	}

	c.JSON(201, building)
}
