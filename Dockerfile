FROM golang:1.25-alpine AS build

WORKDIR /src

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/history-care-api ./cmd/awesomeProject/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/history-care-migrate ./cmd/migrate/main.go

FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates netcat-openbsd

COPY --from=build /out/history-care-api /app/history-care-api
COPY --from=build /out/history-care-migrate /app/history-care-migrate

EXPOSE 8080

CMD ["/app/history-care-api"]
