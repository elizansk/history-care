package handler

import (
	"history-care-texnology/internal/logger"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

func AuthMiddleware(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			logger.Log.WithFields(logrus.Fields{
				"header": authHeader,
				"method": c.Request.Method,
				"path":   c.Request.URL.Path,
			}).Warn("invalid header")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid header"})
			return
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
		if err != nil || !token.Valid {
			logger.Log.WithFields(logrus.Fields{
				"token":  token,
				"method": c.Request.Method,
				"path":   c.Request.URL.Path,
			}).Warn("invalid token")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			logger.Log.WithFields(logrus.Fields{
				"сlaims": claims,
				"method": c.Request.Method,
				"path":   c.Request.URL.Path,
			}).Warn("bad claims")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "bad claims"})
			return
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			logger.Log.WithFields(logrus.Fields{
				"сlaims": claims,
				"method": c.Request.Method,
				"path":   c.Request.URL.Path,
			}).Warn("invalid user_id")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user_id"})
			return
		}
		userID := uint(userIDFloat)

		role, ok := claims["role"].(string)
		if !ok {
			logger.Log.WithFields(logrus.Fields{
				"user_id": userID,
				"method":  c.Request.Method,
				"path":    c.Request.URL.Path,
			}).Warn("invalid role")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid role"})
			return
		}

		// Проверка ролей, если они переданы
		if len(requiredRoles) > 0 {
			allowed := false
			for _, r := range requiredRoles {
				if r == role {
					allowed = true
					break
				}
			}
			if !allowed {
				logger.Log.WithFields(logrus.Fields{
					"user_id": userID,
					"role":    role,
					"method":  c.Request.Method,
					"path":    c.Request.URL.Path,
				}).Warn("Forbidden")
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
				return
			}
		}

		c.Set("user_id", userID)
		c.Set("role", role)
		c.Next()
	}
}
