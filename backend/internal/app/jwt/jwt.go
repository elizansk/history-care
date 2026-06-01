package jwt

import (
	"history-care-texnology/internal/logger"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

var jwtKey = []byte("super_secret_key")

func GenerateJWT(userID, roleID uint, role string, cityApproved bool) (string, error) {
	claims := jwt.MapClaims{
		"user_id":       userID,
		"role_id":       roleID,
		"role":          role,
		"city_approved": cityApproved,
		"exp":           time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	result, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}
	logger.Log.WithFields(logrus.Fields{
		"user_id":  userID,
		"role_id":  roleID,
		"role":     role,
		"city_ok":  cityApproved,
		"jwtToken": result,
	}).Debug("Generating JWT")
	return result, err
}

func GetJWTKey() []byte {
	return jwtKey
}
