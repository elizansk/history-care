# Национальное наследие

Информационная система для создания, модерации и поддержки заявок на восстановление исторических зданий. Проект объединяет публичный каталог заявок, личные кабинеты пользователей, административную панель, загрузку медиафайлов, AI-генерацию описания здания и демонстрационный сценарий пожертвования.

## Возможности

- просмотр опубликованных заявок на восстановление объектов культурного наследия;
- регистрация пользователей с ролями `user`, `city` и `admin`;
- подтверждение городских администраторов системным администратором;
- создание заявки от имени города: карточка здания, описание, фото, видео, услуги и расчет суммы;
- генерация описания здания через отдельный AI-сервис на Express и Ollama;
- модерация заявок: публикация, отклонение или возврат на доработку;
- создание и управление услугами восстановления;
- пожертвования через Stripe Checkout или демонстрационный режим;
- хранение медиафайлов в MinIO;
- метрики backend для Prometheus и визуализация в Grafana;
- Docker/Kubernetes-инфраструктура и CI/CD pipeline.

## Роли

| Роль | Возможности |
| --- | --- |
| Гость | Просматривает опубликованные заявки и может сделать пожертвование. |
| Пользователь | Входит в личный кабинет, просматривает профиль и участвует в пожертвованиях. |
| Администратор города | После подтверждения создает заявки на восстановление зданий своего города. |
| Администратор системы | Подтверждает city-пользователей, модерирует заявки, управляет услугами и следит за системой. |

## Стек

| Часть системы | Технологии |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Bootstrap |
| Backend | Go, Gin, GORM, JWT, Prometheus metrics |
| AI-сервис | Node.js, Express, TypeScript, Ollama |
| База данных | PostgreSQL |
| Файловое хранилище | MinIO |
| Платежи | Stripe Checkout / demo mode |
| Инфраструктура | Docker, Kubernetes manifests, GitLab CI/CD |
| Мониторинг | Prometheus, Grafana |

## Структура проекта

```text
.
├── backend/        # Go/Gin API, модели, обработчики, миграции
├── backend_ai/     # Express-сервис генерации описания здания
├── frontend/       # React-приложение
├── compose/        # docker-compose для локальной инфраструктуры
├── manifests/      # Kubernetes-манифесты
├── configs/        # nginx и конфигурации для деплоя
└── docs/           # диаграммы и материалы курсовой
```

## Быстрый запуск через Docker Compose

```bash
cd compose
docker compose up --build
```

После запуска:

- frontend: `http://localhost`
- backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5433`
- MinIO console: `http://localhost:9001`
- Adminer: `http://localhost:8081`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

## Локальный запуск по частям

### Backend

```bash
cd backend
go run ./cmd/migrate/main.go
go run ./cmd/awesomeProject/main.go
```

Основные переменные окружения задаются в `backend/.env.development`.

### AI-сервис

```bash
cd backend_ai
npm install
npm run dev
```

Для генерации описаний нужен доступный Ollama API. Адрес задается переменной `OLLAMA_BASE_URL`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

По умолчанию Vite запускает приложение на `http://localhost:5173`.

## Основные API-домены

| Домен | Примеры методов |
| --- | --- |
| Авторизация | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Пользователи | `GET /api/profile`, `PUT /api/profile`, `GET /api/users`, `PUT /api/users/:id/city-approval` |
| Заявки | `GET /api/orders`, `POST /api/orders/draft`, `PUT /api/orders/:id/form`, `PUT /api/orders/:id/moderate` |
| Здания | `POST /api/buildings`, `PUT /api/buildings/:id` |
| Услуги | `GET /api/services`, `POST /api/services`, `DELETE /api/services/:id` |
| Пожертвования | `GET /api/orders/formed`, `POST /api/donations/checkout`, `POST /api/donations` |
| AI | `POST /generate-building-description` |
| Метрики | `GET /metrics` |

## CI/CD и развертывание

Pipeline собирает frontend и backend, публикует контейнерные образы и применяет Kubernetes-манифесты. На этапе deploy выполняются команды:

```bash
kubectl create configmap history-care-conf --from-file=configs/ --namespace=default -o yaml --dry-run=client | kubectl apply -f -
kubectl apply -R -f manifests/
kubectl set image deployment/history-care-backend history-care-backend="$BACKEND_IMAGE_NAME:$CI_COMMIT_SHORT_SHA" migrate="$BACKEND_IMAGE_NAME:$CI_COMMIT_SHORT_SHA"
kubectl set image deployment/history-care-frontend history-care-frontend="$FRONTEND_IMAGE_NAME:$CI_COMMIT_SHORT_SHA"
kubectl rollout status deployment/history-care-backend
kubectl rollout status deployment/history-care-frontend
```

## Документация

В `docs/` находятся материалы для курсовой работы:

- BPMN и UML-диаграммы;
- логическая и физическая модели данных;
- диаграммы draw.io;
- пояснительная записка;
- план презентации и текст выступления.

## Ссылки

- Репозиторий: `https://github.com/elizansk/history-care`
- GitHub Pages: добавить после публикации frontend
- Backend/API: добавить после публикации backend или стенда

## Автор

Якуш Елизавета, группа ИС-23.
