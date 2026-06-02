package storage

import (
	"context"
	"fmt"
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

func EnsurePublicBucket(ctx context.Context, bucketName string) error {
	exists, err := MinioClient.BucketExists(ctx, bucketName)
	if err != nil {
		return err
	}

	if !exists {
		if err := MinioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{}); err != nil {
			return err
		}
	}

	policy := fmt.Sprintf(`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::%s/*"]
    }
  ]
}`, bucketName)

	if err := MinioClient.SetBucketPolicy(ctx, bucketName, policy); err != nil {
		log.Println("failed to set public bucket policy:", bucketName, err)
	}

	return nil
}
