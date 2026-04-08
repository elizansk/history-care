package handler

import "github.com/gin-gonic/gin"

func (h *Handler) GetUsers(c *gin.Context) {
	users, err := h.repo.GetAllUsers()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch users"})
		return
	}

	c.JSON(200, users)
}
