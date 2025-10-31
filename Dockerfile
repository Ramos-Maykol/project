# Multi-stage build para optimizar el tamaño de la imagen

# Etapa 1: Build del frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente y archivos públicos
COPY . .
COPY public ./public

# Build del frontend
RUN npm run build

# Etapa 2: Build del backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar servidor
COPY server ./server
COPY tsconfig*.json ./

# Etapa 3: Imagen final
FROM node:20-alpine

WORKDIR /app

# Instalar tsx para ejecutar TypeScript
RUN npm install -g tsx

# Copiar dependencias del backend
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./

# Copiar código del servidor
COPY server ./server
COPY tsconfig*.json ./

# Copiar build del frontend
COPY --from=frontend-builder /app/dist ./dist

# Exponer puertos
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["tsx", "server/index.ts"]
