package handler

import "history-care-texnology/internal/app/repository"

type Handler struct {
	repo *repository.Repository
}

func NewHandler(r *repository.Repository) *Handler {
	return &Handler{repo: r}
}
