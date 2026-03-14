# History Care 

## Краткое описание проекта

History Care  — это веб-приложение для управления и ухода за историческими зданиями. Проект позволяет пользователям просматривать информацию о зданиях, их фото и видео ресурсы, заказывать услуги реконструкции и делать пожертвования на сохранение культурного наследия. Backend реализован на Go с использованием фреймворка Gin, а frontend — на React с TypeScript и Vite. Приложение использует PostgreSQL для хранения данных и MinIO для хранения медиа-файлов.

## Описание файловой структуры проекта

```
history-care-texnology/
├── Dockerfile                    # Dockerfile для сборки backend приложения
├── README.md                     # Основной файл документации проекта
├── backend/                      # Backend на Go
│   ├── go.mod                    # Файл зависимостей Go
│   ├── go.sum                    # Контрольные суммы зависимостей
│   ├── cmd/
│   │   └── awesomeProject/
│   │       └── main.go           # Точка входа в приложение
│   └── internal/
│       ├── api/
│       │   └── server.go         # Настройка сервера Gin, маршруты
│       ├── app/
│       │   ├── handler/
│       │   │   └── handler.go    # HTTP обработчики
│       │   └── repository/
│       │       └── repository.go # Репозиторий для работы с БД
│       ├── models/
│       │   └── models.go         # Модели данных (User, Building, etc.)
│
├── compose/
│   └── docker-compose.yml        # Конфигурация Docker Compose для запуска сервисов
├── data/                         # Данные для MinIO
│   ├── buildings/                # Ресурсы зданий
│   └── data/                     # Другие данные
└── frontend/                     # Frontend на React + TypeScript
    ├── package.json              # Зависимости Node.js
    ├── tsconfig.json             # Конфигурация TypeScript
    ├── vite.config.ts            # Конфигурация Vite
    ├── public/                   # Публичные статические файлы
    ├── src/
    │   ├── app.tsx               # Главный компонент React
    │   ├── main.tsx              # Точка входа React
    │   ├── resources/            # Ресурсы (CSS, стили)
    │   └── templates/            # HTML шаблоны (buildings.html, etc.)
    └── index.html                # Главный HTML файл
```

## Инструкция по установке и запуску

### Предварительные требования

- Docker и Docker Compose установлены на системе.
- Git для клонирования репозитория.

### Шаги установки

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/elizansk/history-care.git
   cd history-care-texnology
   ```

2. **Запустите сервисы с помощью Docker Compose:**
   ```bash
   cd compose
   docker compose up --build -d
   ```

   Это запустит следующие сервисы:
   - Backend приложение на порту 8080
   - PostgreSQL база данных на порту 5433
   - MinIO для хранения файлов на портах 9000 (API) и 9001 (консоль)
   - Adminer для администрирования БД на порту (проверьте compose файл)

3. **Доступ к приложению:**
   - Основное приложение: http://localhost:8080
   - MinIO консоль: http://localhost:9001 (admin/password122)
   - Adminer: http://localhost:8080 (или укажите порт в compose)



## Список используемых технологий

- **Go 1.25.0** — язык программирования для backend. [Документация](https://golang.org/doc/)
- **Gin** — веб-фреймворк для Go. [Документация](https://gin-gonic.com/ru/docs/)
- **GORM** — ORM для Go с драйвером PostgreSQL. [Документация](https://gorm.io/)
- **PostgreSQL** — реляционная база данных. [Документация](https://www.postgresql.org/docs/)
- **React 19** — библиотека для создания пользовательских интерфейсов. [Документация](https://react.dev/)
- **TypeScript** — надмножество JavaScript с типизацией. [Документация](https://www.typescriptlang.org/docs/)
- **Vite** — инструмент для сборки и разработки frontend. [Документация](https://vitejs.dev/)
- **Docker** — платформа для контейнеризации. [Документация](https://docs.docker.com/)
- **MinIO** — объектное хранилище, совместимое с S3. [Документация](https://min.io/docs/minio/linux/index.html)

## Описание переменных окружения

Приложение использует следующие переменные окружения, которые можно задать в файле `.env` или через Docker Compose:

- `DB_HOST` — хост базы данных PostgreSQL (по умолчанию: postgres)
- `DB_PORT` — порт базы данных (по умолчанию: 5432)
- `DB_USER` — имя пользователя БД (по умолчанию: go_user)
- `DB_PASSWORD` — пароль пользователя БД (по умолчанию: password)
- `DB_NAME` — имя базы данных (по умолчанию: historycare)
- `TEMPLATES_PATH` — путь к HTML шаблонам (по умолчанию: frontend/src/templates/*)
- `STATIC_PATH` — путь к статическим файлам (по умолчанию: frontend/src/resources)

## Описание неочевидных(временных) технических решений 

- **Серверная рендеринг с HTML шаблонами:** Вместо SPA, backend использует Gin для рендеринга HTML страниц с помощью шаблонов из папки `frontend/src/templates/`. Это позволяет серверу генерировать страницы на лету, но требует синхронизации шаблонов между frontend и backend.
- **Интеграция с MinIO:** Для хранения медиа-файлов (фото и видео зданий) используется MinIO, что обеспечивает масштабируемое хранение. Ресурсы зданий хранятся в модели `BuildingResource` с типом (photo/video) и URL.
- **Многослойная архитектура backend:** Код разделен на слои: models (данные), repository (доступ к БД), handler (бизнес-логика и HTTP). Это обеспечивает разделение ответственности и упрощает тестирование.
- **Docker Compose для локальной разработки:** Все сервисы (backend, БД, MinIO) запускаются в контейнерах, что упрощает настройку окружения и изолирует зависимости.
- **Использование GORM с PostgreSQL:** ORM обеспечивает удобную работу с БД, включая миграции и связи между моделями (например, Building связан с Region и Category).