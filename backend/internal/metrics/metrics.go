package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	// количество HTTP запросов
	HttpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	// время ответа
	HttpDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path", "status"},
	)

	// ошибки
	HttpErrorsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_errors_total",
			Help: "Total number of HTTP errors",
		},
		[]string{"status"},
	)

	// авторизация
	AuthAttempts = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "auth_attempts_total",
			Help: "Authentication attempts",
		},
		[]string{"status"}, // success / fail
	)
)

func Init() {
	prometheus.MustRegister(
		HttpRequestsTotal,
		HttpDuration,
		HttpErrorsTotal,
		AuthAttempts,
	)
}
