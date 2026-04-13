package middleware

import (
	"history-care-texnology/internal/app/jwt"
	"history-care-texnology/internal/logger"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	gjwt "github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

func AuthMiddleware(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Фиксируем факт доступа к защищённому endpoint + требуемые роли
		logger.Log.WithFields(logrus.Fields{
			"requiredRoles": requiredRoles,
			"method":        c.Request.Method,
			"path":          c.Request.URL.Path,
		}).Warn("AuthMiddleware called with roles")
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// нет токена → попытка неавторизованного доступа
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			logger.Log.WithFields(logrus.Fields{
				//неправильный формат Authorization header
				"header": authHeader,
				"method": c.Request.Method,
				"path":   c.Request.URL.Path,
			}).Warn("invalid header")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid header"})
			return
		}

		tokenStr := parts[1]
		token, err := gjwt.Parse(tokenStr, func(token *gjwt.Token) (interface{}, error) {
			return jwt.GetJWTKey(), nil
		})
		if err != nil || !token.Valid {
			//невалидный JWT (подпись/истёк/повреждён)
			logger.Log.WithFields(logrus.Fields{
				"token":  token,
				"method": c.Request.Method,
				"path":   c.Request.URL.Path,
			}).Warn("invalid token")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		claims, ok := token.Claims.(gjwt.MapClaims)
		if !ok {
			logger.Log.WithFields(logrus.Fields{
				//некорректная структура claims (JWT сломан или не наш формат)
				"сlaims": claims,
				"method": c.Request.Method,
				"path":   c.Request.URL.Path,
			}).Warn("bad claims")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "bad claims"})
			return
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok { //отсутствует/битый user_id в токене
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
		if !ok { //отсутствует роль в токене
			logger.Log.WithFields(logrus.Fields{
				"user_id": userID,
				"method":  c.Request.Method,
				"path":    c.Request.URL.Path,
			}).Warn("invalid role")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid role"})
			return
		}

		// Проверка ролей, если они переданы
		if len(requiredRoles) > 0 { // если роль пользователя НЕ входит в allowed roles → 403
			allowed := false
			for _, r := range requiredRoles {
				if r == role {
					allowed = true
					break
				}
			}
			if !allowed { //отказ в доступе (AUTHORIZATION FAIL / 403)
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
		// пользователь прошёл проверку JWT + роль
		c.Set("user_id", userID)
		c.Set("role", role)
		c.Next()
	}
}
