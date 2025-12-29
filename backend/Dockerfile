# Backend Dockerfile - Cloud Run Compatible
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Cloud Run sets PORT automatically (default 8080)
# The app reads from process.env.PORT
EXPOSE 8080

CMD ["npm", "start"]
