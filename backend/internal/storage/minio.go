package storage

import (
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

func InitMinio() {
	var err error

	MinioClient, err = minio.New("localhost:9000", &minio.Options{
		Creds:  credentials.NewStaticV4("admin", "password122", ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalln(err)
	}

	log.Println("MinIO initialized")
}
