package handler

import (
	"history-care-texnology/internal/app/repository"

	"github.com/redis/go-redis/v9"
)

type Handler struct {
	repo  *repository.Repository
	redis *redis.Client
}

func NewHandler(r *repository.Repository, redis *redis.Client) *Handler {
	return &Handler{repo: r, redis: redis}
}
