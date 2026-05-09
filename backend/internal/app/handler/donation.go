package handler

import (
	"history-care-texnology/internal/app/jwt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	gjwt "github.com/golang-jwt/jwt/v5"
)

type DonationRequest struct {
	OrderID uint    `json:"order_id" binding:"required"`
	Amount  float64 `json:"amount" binding:"required,gt=0"`
	Name    *string `json:"name"`
	Email   *string `json:"email"`
}

type DonationResponse struct {
	ID           uint    `json:"id"`
	OrderID      uint    `json:"order_id"`
	Amount       float64 `json:"amount"`
	UserID       *uint   `json:"user_id"`
	CreatorName  *string `json:"creator_name"`
	CreatorEmail *string `json:"creator_email"`
	Message      string  `json:"message"`
}

// @Summary      Post a donation
// @Description  Добавляет пожертвование на заявку
// @Tags         donation
// @Accept       json
// @Produce      json
// @Param        donationRequest body DonationRequest true "Donation data"
// @Success      201 {object} DonationResponse
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /api/donations [post]
func (h *Handler) PostDonate(ctx *gin.Context) {
	var req DonationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	var userID *uint
	var name *string
	var email *string

	// Try to parse JWT from Authorization header
	authHeader := ctx.GetHeader("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			tokenStr := parts[1]
			if tokenStr == "" {
				cookieToken, err := ctx.Cookie("token")
				if err == nil {
					tokenStr = cookieToken
				}
			}
			token, err := gjwt.Parse(tokenStr, func(token *gjwt.Token) (interface{}, error) {
				return jwt.GetJWTKey(), nil
			})
			if err == nil && token.Valid {
				claims, ok := token.Claims.(gjwt.MapClaims)
				if ok {
					if userIDFloat, ok := claims["user_id"].(float64); ok {
						id := uint(userIDFloat)
						userID = &id
					}
				}
			}
		}
	}

	// If no JWT, use name and email from request
	if userID == nil {
		name = req.Name
		email = req.Email
	}

	// Save donation
	err := h.repo.AddDonation(req.OrderID, userID, req.Amount, name, email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create donation"})
		return
	}

	ctx.JSON(http.StatusCreated, DonationResponse{
		OrderID:      req.OrderID,
		Amount:       req.Amount,
		UserID:       userID,
		CreatorName:  name,
		CreatorEmail: email,
		Message:      "Donation created successfully",
	})
}
