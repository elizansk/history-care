package api

import (
	"log"

	"history-care/internal/app/handler"
	"history-care/internal/app/repository"

	"github.com/gin-gonic/gin"
)

func StartServer() {
	log.Println("Starting server")

	repo := repository.NewRepository()
	if repo == nil {
		log.Fatal("ошибка инициализации репозитория")
	}

	h := handler.NewHandler(repo)

	r := gin.Default()

	r.LoadHTMLGlob("../frontend/src/templates/*")

	r.Static("/static", "../frontend/src/resources")

	r.GET("/buildings", h.GetBuildings)
	r.GET("/building/:id", h.GetBuilding)
	r.GET("/donate/:id", h.GetDonate)

	r.GET("/", func(c *gin.Context) {
		c.Redirect(302, "/buildings")
	})

	r.Run(":8080")
}
