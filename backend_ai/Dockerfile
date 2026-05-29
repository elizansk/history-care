# Используем официальный Node образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

# Компилируем TypeScript
RUN npm run build

# Открываем порт
EXPOSE 3000

# Запуск приложения
CMD ["node", "dist/index.js"]
