# frontend/Dockerfile

# ---- Build stage ----
  FROM node:22-alpine AS build

  WORKDIR /app
  
  COPY package*.json ./
  RUN npm install
  
  COPY . .
  
  # Accept API URL at build time
  ARG VITE_API_BASE_URL
  ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
  
  # Vite will read VITE_* env vars at build time
  RUN npm run build
  
  # ---- Run stage ----
  FROM nginx:alpine
  
  # For SPA routing, you can customize nginx.conf later if needed
  COPY --from=build /app/dist /usr/share/nginx/html
  
  EXPOSE 80
  
  CMD ["nginx", "-g", "daemon off;"]
  