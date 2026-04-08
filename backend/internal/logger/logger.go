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
