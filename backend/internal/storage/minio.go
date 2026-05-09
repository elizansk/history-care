package storage

import (
	"log"
	"os"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

func InitMinio() {
	var err error

	MinioClient, err = minio.New(os.Getenv("MINIO_HOST"), &minio.Options{
		Creds:  credentials.NewStaticV4(os.Getenv("MINIO_KEY"), os.Getenv("MINIO_SECRET"), ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalln(err)
	}

	log.Println("MinIO initialized")
}
