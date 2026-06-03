# Национальное наследие

`Национальное наследие` - информационная система для публикации заявок на реконструкцию исторических зданий и сбора пожертвований на их восстановление. Проект объединяет публичный каталог объектов, личные кабинеты пользователей, административную панель, загрузку фото и видео, AI-генерацию описания здания, демонстрационную оплату и мониторинг работы backend.

## Ссылки

| Ресурс | Ссылка |
| --- | --- |
| GitHub Pages | https://elizansk.github.io/history-care/ |
| Основной сайт | http://history-care.ru |
| Backend API / Swagger | http://api.history-care.ru/swagger/index.html |
| AI-сервис | http://ai.history-care.ru |
| Grafana | http://grafana.history-care.ru |
| Prometheus | http://prometheus.history-care.ru |
| Adminer | http://adminer.history-care.ru |
| MinIO | http://minio.history-care.ru |
| Репозиторий GitHub | https://github.com/elizansk/history-care |
| Репозиторий MosHub | https://hub.mos.ru/liza.forspam/lab8-architecture |

## Возможности системы

- просмотр опубликованных заявок на реконструкцию исторических зданий;
- регистрация и авторизация пользователей;
- разделение доступа по ролям: гость, пользователь, администратор города, администратор системы;
- подтверждение городских администраторов системным администратором;
- создание заявки от имени города или через администратора;
- загрузка основного фото, дополнительных материалов и видео по объекту;
- автоматическая генерация описания здания через отдельный AI-сервис;
- выбор услуг реконструкции и автоматический расчет итоговой суммы;
- модерация заявок администратором системы;
- пожертвование на опубликованные заявки через Stripe Checkout;
- хранение медиафайлов в MinIO;
- сбор метрик backend в Prometheus и визуализация в Grafana;
- развертывание в Kubernetes через GitLab CI/CD.

## Роли пользователей

| Роль | Что доступно |
| --- | --- |
| Гость | Просмотр главной страницы, опубликованных заявок и донат на выбранную заявку. |
| Пользователь | Личный кабинет, просмотр профиля и участие в пожертвованиях. |
| Администратор города | Создание и формирование заявок после подтверждения системным администратором. |
| Администратор системы | Подтверждение city-пользователей, создание заявок, модерация, управление услугами и контроль системы. |

## Технологический стек

| Часть | Технологии |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Redux Toolkit, Axios, React Bootstrap, PWA |
| Desktop | Tauri |
| Backend | Go, Gin, GORM, JWT, Swagger, Prometheus metrics |
| AI-сервис | Node.js, Express, TypeScript, Ollama API |
| База данных | PostgreSQL |
| Кэш и служебное хранилище | Redis |
| Файлы | MinIO |
| Платежи | Stripe Checkout |
| Инфраструктура | Docker, Docker Compose, Kubernetes/k3s, Ingress |
| CI/CD | GitLab CI/CD |
| Мониторинг | Prometheus, Grafana |

## Структура проекта

```text
.
├── backend/        # Go/Gin API, обработчики, репозитории, модели, миграции
├── backend_ai/     # Express-сервис для генерации описания здания через Ollama
├── frontend/       # React/Vite приложение, PWA и Tauri-конфигурация
├── compose/        # docker-compose для локального запуска инфраструктуры
├── configs/        # nginx-конфигурации для стенда
├── manifests/      # Kubernetes-манифесты сервисов, ingress и deployment
└── grafana-dashboards/ # JSON-дашборды Grafana для импорта
```

## Локальный запуск

### 1. Инфраструктура через Docker Compose

```bash
cd compose
docker compose up --build
```

После запуска доступны:

| Сервис | Локальный адрес |
| --- | --- |
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| AI-сервис | http://localhost:3000 |
| PostgreSQL | localhost:5433 |
| MinIO | http://localhost:9001 |
| Adminer | http://localhost:8081 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

### 2. Backend отдельно

```bash
cd backend
go run ./cmd/migrate/main.go
go run ./cmd/awesomeProject/main.go
```

Основные переменные окружения backend задаются в `backend/.env.development`.

### 3. AI-сервис отдельно

```bash
cd backend_ai
npm install
npm run dev
```

Для генерации описаний нужен доступ к Ollama API. Адрес задается через `OLLAMA_BASE_URL`, модель - через `OLLAMA_MODEL`.

### 4. Frontend отдельно

```bash
cd frontend
npm install
npm run dev
```

Vite запускает приложение на `http://localhost:5173`. В режиме разработки запросы `/api` проксируются на backend, а `/ai` - на AI-сервис.

## Сборка frontend

```bash
cd frontend
npm run build
```

Сборка для GitHub Pages:

```bash
cd frontend
npm run build:github
```

В этом режиме используется базовый путь `/history-care/`, поэтому приложение корректно открывается на GitHub Pages.

## Основные API-домены

| Домен | Примеры методов |
| --- | --- |
| Авторизация | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Пользователи | `GET /api/profile`, `PUT /api/profile`, `GET /api/users`, `PUT /api/users/:id/city-approval` |
| Заявки | `GET /api/orders`, `POST /api/orders/draft`, `PUT /api/orders/:id/form`, `PUT /api/orders/:id/moderate` |
| Здания | `POST /api/buildings`, `PUT /api/buildings/:id` |
| Услуги | `GET /api/services`, `GET /api/services/:id`, `POST /api/services`, `DELETE /api/services/:id` |
| Пожертвования | `GET /api/orders/formed`, `POST /api/donations/checkout`, `POST /api/donations` |
| AI | `POST /generate-building-description` |
| Метрики | `GET /metrics` |

## Развертывание

Проект разворачивается в Kubernetes/k3s. Основные манифесты находятся в `manifests/`:

- `backend` - основной Go API;
- `backend-ai` - AI-сервис на Express;
- `frontend` - nginx со статической сборкой React;
- `postgres` - база данных;
- `redis` - кэш;
- `minio` - файловое хранилище;
- `adminer` - просмотр базы данных;
- `prometheus` - сбор метрик;
- `grafana` - визуализация метрик.

CI/CD pipeline выполняет сборку Docker-образов, загрузку образов в кластер и обновление Kubernetes deployment на ветке `main`.

## Мониторинг

Backend публикует метрики на endpoint:

```text
/metrics
```

Prometheus собирает эти метрики, а Grafana используется для демонстрационного дашборда: количество HTTP-запросов, ошибки, время ответа, нагрузка по endpoint и состояние сервисов.

## Документация и диаграммы

В проекте подготовлены материалы для курсовой работы: BPMN, диаграммы прецедентов, состояний, развертывания, последовательности HTTP-запросов, логическая и физическая модели данных, а также пояснительная записка.

## Автор

Якуш Елизавета Анатольевна, группа ИС-23.
