FROM golang:1.25-alpine

WORKDIR /app


COPY ../backend/go.mod ../backend/go.sum ./
RUN go mod download


COPY ../backend ./backend


WORKDIR /app/backend
RUN go build -o /app/main ./cmd/awesomeProject/main.go


WORKDIR /app

EXPOSE 8080
CMD ["./main"]