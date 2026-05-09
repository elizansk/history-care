package logger

import (
	"io"
	"os"

	"github.com/sirupsen/logrus"
)

var Log = logrus.New()

func InitLogger(env string) {
	Log.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	if env == "development" {
		Log.SetLevel(logrus.DebugLevel)
	} else {
		Log.SetLevel(logrus.InfoLevel)
	}

	file, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		Log.SetOutput(io.MultiWriter(os.Stdout, file))
	} else {
		Log.SetOutput(os.Stdout)
		Log.Warn("Failed to log to file, using default stdout")
	}
}
func CacheHit(key string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_hit",
	}).Info("cache hit")
}

func CacheMiss(key string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_miss",
	}).Info("cache miss")
}

func CacheSet(key string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_set",
	}).Info("cache set")
}

func CacheInvalidate(key string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_invalidate",
	}).Info("cache invalidate")
}

func CacheError(key string, err error, op string) {
	Log.WithFields(logrus.Fields{
		"cache_key": key,
		"event":     "cache_error",
		"operation": op,
		"error":     err.Error(),
	}).Error("cache error")
}
