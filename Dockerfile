# Etapa de construcción (Build)
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código fuente y compilar la aplicación
COPY . .
RUN npm run build

# Etapa de producción (Production)
FROM nginx:stable-alpine

# Copiar los archivos compilados al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx para soportar enrutamiento SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
