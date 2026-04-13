package metrics

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		duration := time.Since(start).Seconds()
		status := c.Writer.Status()

		method := c.Request.Method
		path := c.FullPath()
		if path == "" {
			path = "unknown"
		}

		statusStr := strconv.Itoa(status)

		// запросы
		HttpRequestsTotal.WithLabelValues(
			method,
			path,
			statusStr,
		).Inc()

		// latency
		HttpDuration.WithLabelValues(
			method,
			path,
			statusStr,
		).Observe(duration)

		// ошибки
		if status >= 400 && status < 500 {
			HttpErrorsTotal.WithLabelValues("4xx").Inc()
		}
		if status >= 500 {
			HttpErrorsTotal.WithLabelValues("5xx").Inc()
		}
	}
}
