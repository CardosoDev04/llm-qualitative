# backend/Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Copy environment variables
COPY .env .env

# Runtime
EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
