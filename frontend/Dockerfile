#Берем Node.js для сборки frontend
FROM node:20 AS build
WORKDIR /app
#Build-переменная для Vite пустая потому что забросы через nginx
ARG VITE_API_URL=
ARG VITE_AI_API_URL=/ai
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL
#Устанавливаем зависимости, копируем frontend, собираем production build
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
#Финальный контейнер nginx, туда кладется собранный frontend
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
#Удаляем дефолтный nginx-конфиг и кладем свой
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/nginx.conf
#Frontend доступен на 80 порту
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
