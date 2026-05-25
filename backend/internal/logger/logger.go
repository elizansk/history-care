package logger

import (
	"io"
	"os"

	"github.com/sirupsen/logrus"
)

var Log = logrus.New()

func InitLogger(env string) {
	// Включаем время события в логах
	Log.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	// В development пишем больше диагностических логов
	if env == "development" {
		Log.SetLevel(logrus.DebugLevel)
	} else {
		Log.SetLevel(logrus.InfoLevel)
	}

	// Пишем логи и в консоль, и в файл app.log
	file, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		Log.SetOutput(io.MultiWriter(os.Stdout, file))
	} else {
		// Если файл не открылся, оставляем вывод только в консоль
		Log.SetOutput(os.Stdout)
		Log.Warn("Failed to log to file, using default stdout")
	}
}

// Логирует попадание в кэш
func CacheHit(key string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_hit",
	}).Info("cache hit")
}

// Логирует промах кэша
func CacheMiss(key string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_miss",
	}).Info("cache miss")
}

// Логирует запись данных в кэш
func CacheSet(key string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_set",
	}).Info("cache set")
}

// Логирует удаление кэша
func CacheInvalidate(key string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_invalidate",
	}).Info("cache invalidate")
}

// Логирует ошибку работы с кэшем
func CacheError(key string, err error, op string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_error",
		"operation": op,
		"error":     err.Error(),
	}).Error("cache error")
}
