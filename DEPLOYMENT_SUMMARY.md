# 📦 Resumen de Configuración de Docker

## ✅ Archivos Creados

### Archivos de Configuración Docker
- **`Dockerfile`** - Imagen multi-stage para frontend y backend
- **`docker-compose.yml`** - Orquestación de todos los servicios
- **`.dockerignore`** - Archivos excluidos del build
- **`nginx.conf`** - Configuración del reverse proxy

### Archivos de Configuración
- **`.env.docker`** - Plantilla de variables de entorno para Docker
- **`database/00-init-n8n.sql`** - Script de inicialización de BD para n8n

### Scripts de Inicio
- **`docker-start.ps1`** - Script de inicio para Windows
- **`docker-start.sh`** - Script de inicio para Linux/Mac

### Documentación
- **`DOCKER_DEPLOYMENT.md`** - Guía completa de despliegue
- **`DOCKER_QUICKSTART.md`** - Guía de inicio rápido
- **`DEPLOYMENT_SUMMARY.md`** - Este archivo

## 🐳 Servicios Incluidos

### 1. PostgreSQL (`postgres`)
- **Puerto**: 5432
- **Base de datos**: manufactura_db + n8n
- **Volumen**: postgres_data (persistente)

### 2. Aplicación Web (`app`)
- **Puerto**: 3000
- **Tecnología**: React + Vite + Express + TypeScript
- **Incluye**: Frontend build + Backend API

### 3. n8n (`n8n`)
- **Puerto**: 5678
- **Función**: Automatización de workflows
- **Volumen**: n8n_data (persistente)
- **Workflows**: Montados desde ./n8n/workflows

### 4. Nginx (`nginx`)
- **Puerto**: 80
- **Función**: Reverse proxy
- **Rutas**:
  - `/` → Aplicación principal
  - `/n8n/` → n8n
  - `/api/` → Backend API

## 🚀 Comandos Principales

### Iniciar
```bash
# Opción 1: Script automático
.\docker-start.ps1  # Windows
./docker-start.sh   # Linux/Mac

# Opción 2: Comando directo
docker-compose up -d
```

### Detener
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f
```

### Reiniciar
```bash
docker-compose restart
```

### Reconstruir
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Aplicación | http://localhost | Frontend principal |
| API | http://localhost/api/health | Health check del backend |
| n8n | http://localhost/n8n | Panel de automatización |
| PostgreSQL | localhost:5432 | Base de datos |

## 🔐 Credenciales por Defecto

### Aplicación
- **Admin**: admin@manufactura.com / admin123
- **Operador**: operador@manufactura.com / operador123

### n8n
- **Usuario**: admin (configurable en .env)
- **Password**: admin123 (configurable en .env)

### PostgreSQL
- **Usuario**: postgres
- **Password**: postgres123 (configurable en .env)
- **Base de datos**: manufactura_db, n8n

## ⚠️ Importante para Producción

Antes de desplegar en producción, **DEBES**:

1. ✅ Cambiar todas las contraseñas en `.env`
2. ✅ Configurar HTTPS/SSL
3. ✅ Actualizar `nginx.conf` con tu dominio
4. ✅ Configurar backups automáticos de PostgreSQL
5. ✅ Revisar y ajustar límites de recursos
6. ✅ Implementar monitoreo y logging

## 📊 Volúmenes Persistentes

Los siguientes datos se persisten entre reinicios:

- **postgres_data**: Todas las bases de datos
- **n8n_data**: Configuración y workflows de n8n

Para hacer backup:
```bash
# Backup de PostgreSQL
docker-compose exec postgres pg_dump -U postgres manufactura_db > backup.sql

# Backup de n8n
docker-compose exec n8n tar czf - /home/node/.n8n > n8n-backup.tar.gz
```

## 🔧 Personalización

### Cambiar puertos
Edita `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Cambiar puerto 80 a 8080
```

### Agregar más recursos
Edita `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

### Variables de entorno adicionales
Edita `.env` y agrega las variables necesarias.

## 🐛 Solución de Problemas

### Los servicios no inician
```bash
docker-compose logs
docker-compose ps
```

### Limpiar y reiniciar
```bash
docker-compose down -v
docker-compose up -d
```

### Verificar salud de servicios
```bash
docker-compose ps
curl http://localhost/api/health
```

## 📚 Documentación Adicional

- **Guía completa**: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **Inicio rápido**: [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)
- **README principal**: [README.md](./README.md)
- **Configuración de BD**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## 🎯 Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Iniciar servicios con Docker
3. ✅ Acceder a http://localhost
4. ✅ Iniciar sesión con credenciales por defecto
5. ✅ Configurar workflows en n8n
6. ✅ Personalizar según necesidades

## 💡 Tips

- Usa `docker-compose logs -f app` para ver logs en tiempo real
- Los workflows de n8n se pueden editar directamente en `./n8n/workflows`
- Para desarrollo, puedes montar el código fuente como volumen
- Usa `docker stats` para monitorear uso de recursos
- Configura healthchecks personalizados según tus necesidades

---

**¿Necesitas ayuda?** Consulta la documentación completa o revisa los logs de los servicios.
