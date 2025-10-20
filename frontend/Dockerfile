FROM node:22.12-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта
COPY . .

# Открываем порт для разработки
EXPOSE 5173

# Запускаем dev сервер
CMD ["npm", "run", "dev", "--", "--host"]

