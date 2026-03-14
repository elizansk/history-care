# Frontend для Care Technology

## Краткое описание проекта

Frontend часть проекта History Care реализована на React с TypeScript и Vite. Предоставляет пользовательский интерфейс для просмотра исторических зданий, их ресурсов, заказа услуг реконструкции и пожертвований. Использует современные инструменты для быстрой разработки и сборки.

## Описание файловой структуры проекта

```
frontend/
├── Dockerfile                # Dockerfile для раздачи статических файлов через Nginx
├── package.json              # Зависимости Node.js и скрипты
├── tsconfig.json             # Конфигурация TypeScript
├── tsconfig.app.json         # Конфигурация TypeScript для приложения
├── tsconfig.node.json        # Конфигурация TypeScript для Node.js
├── vite.config.ts            # Конфигурация Vite
├── eslint.config.js          # Конфигурация ESLint
├── index.html                # Главный HTML файл
├── public/                   # Публичные статические файлы
└── src/
    ├── app.css               # Стили приложения
    ├── app.tsx               # Главный компонент React
    ├── index.css             # Глобальные стили
    ├── main.tsx              # Точка входа React
    ├── resources/
    │   ├── css/
    │   │   └── style.css     # Дополнительные стили
    │   └── styles/
    │       ├── index_style.css
    │       └── order_style.css # Стили для страниц
    └── templates/
        ├── building.html     # Шаблон страницы здания
        ├── buildings.html    # Шаблон списка зданий
        └── donate.html       # Шаблон страницы пожертвований
```

## Инструкция по установке и запуску

### Предварительные требования

- Node.js 18+ установлен.
- npm или yarn.

### Шаги установки

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Запустите в режиме разработки:**
   ```bash
   npm run dev
   ```
   Приложение будет доступно на http://localhost:5173.

3. **Сборка для production:**
   ```bash
   npm run build
   npm run preview
   ```

4. **Линтинг:**
   ```bash
   npm run lint
   ```

### Для Docker

Используйте Dockerfile в папке frontend для сборки образа с Nginx.

## Список используемых технологий

- **React 19** — библиотека для создания пользовательских интерфейсов. [Документация](https://react.dev/)
- **TypeScript** — надмножество JavaScript с типизацией. [Документация](https://www.typescriptlang.org/docs/)
- **Vite** — инструмент для сборки и разработки. [Документация](https://vitejs.dev/)
- **ESLint** — линтер для JavaScript/TypeScript. [Документация](https://eslint.org/docs/)
- **Prettier** — форматировщик кода. [Документация](https://prettier.io/docs/)
- **Stylelint** — линтер для CSS. [Документация](https://stylelint.io/)
- **Husky** — инструмент для git hooks. [Документация](https://typicode.github.io/husky/)
- **lint-staged** — запуск линтеров на staged файлах. [Документация](https://github.com/okonet/lint-staged)

## Описание неочевидных(временных) технических решений

- **HTML шаблоны в src/templates:** Шаблоны используются backend для серверного рендеринга, но хранятся в frontend для удобства разработки.
- **Конфигурация ESLint и Stylelint:** Расширенная настройка для строгого контроля качества кода и стилей.
- **Git hooks с Husky:** Автоматический запуск линтеров перед коммитом для поддержания качества кода.
