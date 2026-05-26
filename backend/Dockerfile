# беремм go образ
FROM golang:1.25-alpine AS build 
#Рабочая папка внутри контейнера сборки
WORKDIR /src
#Копируем зависимости и скачиваем их отдельно
#чтобы Docker мог кэшировать этот слой
COPY go.mod go.sum ./
RUN go mod download
#Копируем весь backend-код
COPY . .
#Собираем основной backend API
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/history-care-api ./cmd/awesomeProject/main.go
#Собираем отдельный бинарник мигратора
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/history-care-migrate ./cmd/migrate/main.go
#Финальный легкий образ
FROM alpine:3.20
#Рабочая папка и установка nc
# который нужен initContainer’у ждать Postgres
WORKDIR /app

RUN apk add --no-cache ca-certificates netcat-openbsd
#Копируем собранные бинарники из build-stage
COPY --from=build /out/history-care-api /app/history-care-api
COPY --from=build /out/history-care-migrate /app/history-care-migrate
#Backend слушает 8080, по умолчанию запускается API
EXPOSE 8080

CMD ["/app/history-care-api"]
