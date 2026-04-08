package handler

import (
	"history-care-texnology/internal/logger"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

var jwtKey = []byte("super_secret_key")

func generateJWT(userID uint, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role, // добавляем роль
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	logger.Log.WithFields(logrus.Fields{
		"user_id":  userID,
		"role":     role,
		"jwtToken": token,
	}).Debug("Generating JWT")
	return token.SignedString(jwtKey)
}
