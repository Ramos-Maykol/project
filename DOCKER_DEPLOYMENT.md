# 🐳 Despliegue con Docker

Este documento describe cómo desplegar el Sistema de Predicción de Producción Manufacturera usando Docker y Docker Compose.

## 📋 Requisitos Previos

- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido en Docker Desktop)
- Al menos 4GB de RAM disponible
- Puertos disponibles: 80, 3000, 5432, 5678

## 🚀 Inicio Rápido

### 1. Clonar el repositorio (si aún no lo has hecho)

```bash
git clone <tu-repositorio>
cd project
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y ajusta las credenciales:

```bash
# En Windows PowerShell
Copy-Item .env.docker .env

# En Linux/Mac
cp .env.docker .env
```

Edita el archivo `.env` y cambia las contraseñas por defecto:

```env
DB_PASSWORD=tu_contraseña_segura
N8N_USER=tu_usuario_n8n
N8N_PASSWORD=tu_contraseña_n8n
```

### 3. Iniciar todos los servicios

```bash
docker-compose up -d
```

Este comando iniciará:
- ✅ PostgreSQL (Base de datos)
- ✅ Aplicación Web (Frontend + Backend)
- ✅ n8n (Automatización de workflows)
- ✅ Nginx (Reverse proxy)

### 4. Verificar que los servicios estén corriendo

```bash
docker-compose ps
```

Deberías ver todos los servicios en estado "Up".

### 5. Acceder a la aplicación

- **Aplicación principal**: http://localhost
- **API Backend**: http://localhost/api/health
- **n8n (Automatización)**: http://localhost/n8n
- **PostgreSQL**: localhost:5432

## 📦 Servicios Incluidos

### 1. PostgreSQL (manufactura-db)
- **Puerto**: 5432
- **Base de datos**: manufactura_db
- **Usuario**: postgres
- **Volumen persistente**: postgres_data

### 2. Aplicación Web (manufactura-app)
- **Puerto**: 3000
- **Tecnologías**: React + Vite + Express + TypeScript
- **Incluye**: Frontend y Backend en un solo contenedor

### 3. n8n (manufactura-n8n)
- **Puerto**: 5678
- **Automatización**: Workflows y notificaciones
- **Volumen persistente**: n8n_data
- **Workflows**: Montados desde `./n8n/workflows`

### 4. Nginx (manufactura-nginx)
- **Puerto**: 80
- **Función**: Reverse proxy y balanceo de carga
- **Rutas**:
  - `/` → Aplicación principal
  - `/n8n/` → n8n
  - `/api/` → Backend API

## 🔧 Comandos Útiles

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f n8n
```

### Detener todos los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ Elimina datos)
```bash
docker-compose down -v
```

### Reiniciar un servicio específico
```bash
docker-compose restart app
```

### Reconstruir las imágenes
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Ejecutar comandos dentro de un contenedor
```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d manufactura_db

# Acceder al shell del contenedor de la app
docker-compose exec app sh
```

### Ver uso de recursos
```bash
docker stats
```

## 🗄️ Gestión de Base de Datos

### Backup de la base de datos
```bash
docker-compose exec postgres pg_dump -U postgres manufactura_db > backup.sql
```

### Restaurar backup
```bash
docker-compose exec -T postgres psql -U postgres -d manufactura_db < backup.sql
```

### Ejecutar scripts SQL
```bash
docker-compose exec -T postgres psql -U postgres -d manufactura_db < ./database/seed_orders.sql
```

## 🔐 Seguridad

### Cambiar contraseñas por defecto

**IMPORTANTE**: Antes de desplegar en producción, cambia todas las contraseñas en el archivo `.env`:

```env
# Contraseña de PostgreSQL
DB_PASSWORD=contraseña_muy_segura_123

# Credenciales de n8n
N8N_USER=admin_personalizado
N8N_PASSWORD=contraseña_n8n_segura_456
```

### Configurar HTTPS (Producción)

Para producción, se recomienda usar un certificado SSL. Puedes usar Let's Encrypt con Certbot:

1. Instalar Certbot
2. Obtener certificado
3. Actualizar `nginx.conf` para usar HTTPS

## 🌐 Despliegue en Producción

### Variables de entorno adicionales

Para producción, agrega estas variables al archivo `.env`:

```env
NODE_ENV=production
WEBHOOK_URL=https://tu-dominio.com/
N8N_PROTOCOL=https
```

### Configuración de dominio

1. Actualiza `nginx.conf` con tu dominio
2. Configura DNS para apuntar a tu servidor
3. Configura SSL/TLS

### Escalabilidad

Para escalar la aplicación:

```bash
docker-compose up -d --scale app=3
```

## 🐛 Solución de Problemas

### La base de datos no se conecta

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### El frontend no carga

```bash
# Verificar logs de la app
docker-compose logs app

# Reconstruir la imagen
docker-compose build app
docker-compose up -d app
```

### n8n no inicia

```bash
# Ver logs de n8n
docker-compose logs n8n

# Verificar que PostgreSQL esté disponible
docker-compose exec postgres pg_isready -U postgres
```

### Puertos en uso

Si algún puerto está ocupado, puedes cambiarlos en `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Cambiar puerto 80 a 8080
```

### Limpiar todo y empezar de nuevo

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Limpiar sistema Docker
docker system prune -a --volumes
```

## 📊 Monitoreo

### Healthchecks

Todos los servicios tienen healthchecks configurados:

```bash
docker-compose ps
```

### Verificar salud de la API

```bash
curl http://localhost/api/health
```

## 🔄 Actualizaciones

### Actualizar la aplicación

```bash
# Obtener últimos cambios
git pull

# Reconstruir y reiniciar
docker-compose build
docker-compose up -d
```

### Actualizar solo un servicio

```bash
docker-compose build app
docker-compose up -d app
```

## 📝 Notas Adicionales

- Los datos de PostgreSQL se persisten en el volumen `postgres_data`
- Los workflows de n8n se persisten en el volumen `n8n_data`
- Los workflows también están montados desde `./n8n/workflows` para fácil edición
- El frontend se sirve como archivos estáticos desde el build de Vite
- El backend corre con `tsx` para ejecutar TypeScript directamente

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Consulta la documentación de Docker
4. Revisa los issues del repositorio

## 📚 Recursos

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de n8n](https://docs.n8n.io/)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
