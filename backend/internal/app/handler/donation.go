package handler

import (
	"encoding/json"
	"fmt"
	"history-care-texnology/internal/app/jwt"
	"net/http"
	"net/url"
	"os"
	"strconv"
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

type DonationCheckoutResponse struct {
	URL       string `json:"url"`
	SessionID string `json:"session_id"`
}

type stripeCheckoutSession struct {
	ID  string `json:"id"`
	URL string `json:"url"`
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

// @Summary      Create Stripe checkout session
// @Description  Создает демо-сессию Stripe Checkout для оплаты пожертвования
// @Tags         donation
// @Accept       json
// @Produce      json
// @Param        donationRequest body DonationRequest true "Donation data"
// @Success      200 {object} DonationCheckoutResponse
// @Failure      400 {object} map[string]string
// @Failure      503 {object} map[string]string
// @Router       /api/donations/checkout [post]
func (h *Handler) PostDonationCheckout(ctx *gin.Context) {
	var req DonationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	session, err := createStripeCheckoutSession(req)
	if err != nil {
		ctx.JSON(http.StatusServiceUnavailable, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, DonationCheckoutResponse{
		URL:       session.URL,
		SessionID: session.ID,
	})
}

func createStripeCheckoutSession(req DonationRequest) (*stripeCheckoutSession, error) {
	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	if secretKey == "" {
		return nil, fmt.Errorf("Stripe is not configured: set STRIPE_SECRET_KEY")
	}

	frontendURL := strings.TrimRight(os.Getenv("FRONTEND_URL"), "/")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	currency := strings.ToLower(os.Getenv("STRIPE_CURRENCY"))
	if currency == "" {
		currency = "rub"
	}

	unitAmount := int64(req.Amount * 100)
	if unitAmount <= 0 {
		return nil, fmt.Errorf("donation amount must be greater than zero")
	}

	values := url.Values{}
	values.Set("mode", "payment")
	values.Set("success_url", fmt.Sprintf("%s/donate/%d?payment=success&session_id={CHECKOUT_SESSION_ID}", frontendURL, req.OrderID))
	values.Set("cancel_url", fmt.Sprintf("%s/donate/%d?payment=cancel", frontendURL, req.OrderID))
	values.Set("client_reference_id", strconv.FormatUint(uint64(req.OrderID), 10))
	values.Set("line_items[0][quantity]", "1")
	values.Set("line_items[0][price_data][currency]", currency)
	values.Set("line_items[0][price_data][unit_amount]", strconv.FormatInt(unitAmount, 10))
	values.Set("line_items[0][price_data][product_data][name]", "Пожертвование на восстановление здания")
	values.Set("metadata[order_id]", strconv.FormatUint(uint64(req.OrderID), 10))

	if req.Name != nil && *req.Name != "" {
		values.Set("metadata[name]", *req.Name)
	}
	if req.Email != nil && *req.Email != "" {
		values.Set("customer_email", *req.Email)
		values.Set("metadata[email]", *req.Email)
	}

	request, err := http.NewRequest(http.MethodPost, "https://api.stripe.com/v1/checkout/sessions", strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}
	request.SetBasicAuth(secretKey, "")
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	var session stripeCheckoutSession
	if err := json.NewDecoder(response.Body).Decode(&session); err != nil {
		return nil, err
	}

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("Stripe checkout error: %s", response.Status)
	}
	if session.URL == "" {
		return nil, fmt.Errorf("Stripe checkout session URL is empty")
	}

	return &session, nil
}
