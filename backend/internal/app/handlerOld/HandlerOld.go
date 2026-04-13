package handlerOld

import "history-care-texnology/internal/app/repository"

type HandlerOld struct {
	repo *repository.Repository
}

func OldHandler(r *repository.Repository) *HandlerOld {
	return &HandlerOld{repo: r}
}
