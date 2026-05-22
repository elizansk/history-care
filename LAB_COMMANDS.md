# Команды для лабораторной

## Backend

Запуск backend:

```bash
cd backend
go run ./cmd/awesomeProject
```

Миграции базы данных:

```bash
cd backend
go run ./cmd/migrate
```

Проверка backend:

```bash
curl http://localhost:8080/api/orders/formed
curl http://localhost:8080/api/categories
curl http://localhost:8080/api/cities
```

Тесты backend:

```bash
cd backend
go test ./...
```

## Frontend

Обычный запуск frontend:

```bash
cd frontend
npm run dev
```

Открыть:

```text
http://localhost:5173
```

Запуск frontend по HTTPS для показа локального HTTPS:

```bash
cd frontend
npm run dev:https
```

Открыть:

```text
https://localhost:5173
```

Сборка frontend:

```bash
cd frontend
npm run build
```


## Генерация API

Генерация TypeScript axios-клиента из Swagger:

```bash
cd frontend
npm run generate-api
```

Команда внутри `package.json`:

```json
"generate-api": "npx @openapitools/openapi-generator-cli generate -i ../backend/docs/swagger.json -g typescript-axios -o src/api/generated"
```

## GitHub Pages

Сборка для GitHub Pages:

```bash
cd frontend
npm run build:github
```

Деплой на GitHub Pages:

```bash
cd frontend
npm run deploy:github
```

Если GitHub Pages должен работать с mock-данными, в `frontend/.env.github-pages`:

```env
VITE_USE_MOCKS=true
```

Если GitHub Pages должен сначала обращаться к backend, а при ошибке брать mock, в `frontend/.env.github-pages`:

```env
VITE_API_URL=https://shifter-voter-geometric.ngrok-free.dev
# VITE_USE_MOCKS=true
```

После изменения `.env.github-pages` нужно заново выполнить:

```bash
cd frontend
npm run deploy:github
```

## Backend для GitHub Pages через ngrok

Установить ngrok:

```bash
brew install ngrok/ngrok/ngrok
```

Добавить токен ngrok:

```bash
ngrok config add-authtoken ТВОЙ_ТОКЕН
```

Запустить tunnel на backend:

```bash
ngrok http 8080
```

Проверить публичный backend:

```bash
curl https://shifter-voter-geometric.ngrok-free.dev/api/orders/formed
```

Web-интерфейс ngrok:

```text
http://127.0.0.1:4040
```

## PWA

Сборка PWA:

```bash
cd frontend
npm run build:pwa
```

Для проверки PWA открыть production-сборку:

```bash
cd frontend
npm run preview
```

В браузере открыть DevTools -> Application -> Manifest / Service Workers.

## Tauri

Файл backend URL для Tauri:

```text
frontend/.env.tauri
```

Пример:

```env
VITE_API_URL=http://10.8.0.2:8080
```

Сборка frontend для Tauri:

```bash
cd frontend
npm run build:tauri
```

Запуск Tauri в dev-режиме:

```bash
cd frontend
npm run tauri:dev
```

Сборка установленного Tauri-приложения:

```bash
cd frontend
npm run tauri:build
```

После изменения `.env.tauri` нужно пересобрать Tauri:

```bash
cd frontend
npm run tauri:build
```

## IP и проверка сетевого подключения

Посмотреть IP компьютера на macOS:

```bash
ifconfig
```

Проверить backend по IP:

```bash
curl http://10.8.0.2:8080/api/orders/formed
```

Найти запросы Tauri/backend через tcpdump:

```bash
sudo tcpdump -i lo0 'port 8080'
```

Если проверяешь по Wi-Fi интерфейсу:

```bash
sudo tcpdump -i en0 'host 10.8.0.2 and port 8080'
```

## Линтеры и проверки

ESLint:

```bash
cd frontend
npm run lint
```

Проверить конкретные CSS-файлы:

```bash
cd frontend
npx stylelint src/resources/css/Orders.css src/resources/css/Order.css src/resources/css/Donate.css
```

Проверить сборки перед защитой:

```bash
cd frontend
npm run build
npm run build:github
npm run build:tauri
```
