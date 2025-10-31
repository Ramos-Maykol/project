# 🐳 Docker - Sistema de Predicción de Producción Manufacturera

## 📦 Resumen

Este proyecto ahora está completamente dockerizado con todos los servicios necesarios para ejecutar el sistema de producción.

## 🚀 Inicio Rápido (3 pasos)

```bash
# 1. Configurar variables de entorno
cp .env.docker .env

# 2. Iniciar servicios
docker-compose up -d

# 3. Acceder
# http://localhost
```

## 📁 Archivos Docker Creados

### Configuración Principal
- **`Dockerfile`** - Imagen multi-stage optimizada
- **`docker-compose.yml`** - Orquestación de servicios
- **`.dockerignore`** - Exclusiones de build
- **`nginx.conf`** - Reverse proxy

### Variables de Entorno
- **`.env.docker`** - Plantilla de configuración
- **`.env`** - Tu configuración (crear desde .env.docker)

### Scripts de Utilidad
- **`docker-start.ps1`** - Inicio automático (Windows)
- **`docker-start.sh`** - Inicio automático (Linux/Mac)
- **`verify-docker.ps1`** - Verificación (Windows)
- **`verify-docker.sh`** - Verificación (Linux/Mac)

### Documentación
- **`DOCKER_DEPLOYMENT.md`** - Guía completa
- **`DOCKER_QUICKSTART.md`** - Inicio rápido
- **`DOCKER_TEST.md`** - Guía de pruebas
- **`DEPLOYMENT_SUMMARY.md`** - Resumen técnico

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│              Nginx (Puerto 80)              │
│         Reverse Proxy / Load Balancer       │
└─────────────┬───────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────┐ ┌────────┐
│  App   │ │n8n │ │  API   │
│ (3000) │ │5678│ │ /api/* │
└───┬────┘ └─┬──┘ └────────┘
    │        │
    └────┬───┘
         ▼
  ┌─────────────┐
  │ PostgreSQL  │
  │   (5432)    │
  └─────────────┘
```

## 🎯 Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **Nginx** | 80 | Reverse proxy principal |
| **App** | 3000 | Frontend + Backend |
| **PostgreSQL** | 5432 | Base de datos |
| **n8n** | 5678 | Automatización |

## 🌐 URLs de Acceso

- **Aplicación**: http://localhost
- **API Health**: http://localhost/api/health
- **n8n**: http://localhost/n8n
- **PostgreSQL**: localhost:5432

## 👤 Credenciales por Defecto

### Aplicación
```
Admin:    admin@manufactura.com / admin123
Operador: operador@manufactura.com / operador123
```

### n8n
```
Usuario:  admin
Password: admin123
```

### PostgreSQL
```
Usuario:  postgres
Password: postgres123
Database: manufactura_db, n8n
```

## 📋 Comandos Esenciales

### Inicio y Detención
```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ Borra datos)
docker-compose down -v
```

### Logs y Monitoreo
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f n8n

# Ver estado de servicios
docker-compose ps

# Ver uso de recursos
docker stats
```

### Mantenimiento
```bash
# Reiniciar un servicio
docker-compose restart app

# Reconstruir imágenes
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose build && docker-compose up -d
```

### Base de Datos
```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d manufactura_db

# Backup
docker-compose exec postgres pg_dump -U postgres manufactura_db > backup.sql

# Restaurar
docker-compose exec -T postgres psql -U postgres -d manufactura_db < backup.sql

# Ver tablas
docker-compose exec postgres psql -U postgres -d manufactura_db -c "\dt"
```

## 🔧 Configuración

### Cambiar Contraseñas

Edita `.env`:
```env
DB_PASSWORD=tu_contraseña_segura
N8N_USER=tu_usuario
N8N_PASSWORD=tu_contraseña_n8n
```

Luego reinicia:
```bash
docker-compose down
docker-compose up -d
```

### Cambiar Puertos

Edita `docker-compose.yml`:
```yaml
services:
  nginx:
    ports:
      - "8080:80"  # Cambiar puerto 80 a 8080
```

## 📊 Volúmenes Persistentes

Los datos se guardan en:
- **postgres_data**: Bases de datos
- **n8n_data**: Configuración de n8n

Ubicación:
```bash
# Ver volúmenes
docker volume ls | grep project

# Inspeccionar volumen
docker volume inspect project_postgres_data
```

## 🔒 Seguridad

### Para Desarrollo
- ✅ Contraseñas por defecto están bien
- ✅ HTTP está bien
- ✅ Puertos expuestos están bien

### Para Producción
- ⚠️ Cambiar TODAS las contraseñas
- ⚠️ Configurar HTTPS/SSL
- ⚠️ Cerrar puertos innecesarios
- ⚠️ Configurar firewall
- ⚠️ Implementar backups automáticos

## 🐛 Solución de Problemas

### Servicios no inician
```bash
# Ver qué falló
docker-compose logs

# Verificar estado
docker-compose ps

# Reiniciar todo
docker-compose down
docker-compose up -d
```

### Puerto en uso
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :80    # Windows
lsof -i :80                   # Linux/Mac

# Cambiar puerto en docker-compose.yml
```

### Base de datos no conecta
```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar salud
docker-compose exec postgres pg_isready -U postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Limpiar todo
```bash
# Detener y eliminar todo
docker-compose down -v

# Limpiar sistema Docker
docker system prune -a --volumes

# Reiniciar desde cero
docker-compose up -d
```

## 📚 Documentación Completa

- **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** - Guía completa de despliegue
- **[DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)** - Inicio rápido
- **[DOCKER_TEST.md](./DOCKER_TEST.md)** - Guía de pruebas
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Resumen técnico
- **[README.md](./README.md)** - README principal del proyecto

## 🎓 Flujo de Trabajo Recomendado

### Primera Vez
1. Clonar repositorio
2. Copiar `.env.docker` a `.env`
3. Ejecutar `docker-compose up -d`
4. Verificar con `.\verify-docker.ps1`
5. Acceder a http://localhost

### Desarrollo Diario
1. Iniciar: `docker-compose up -d`
2. Trabajar normalmente
3. Ver logs: `docker-compose logs -f`
4. Detener: `docker-compose down`

### Actualizar Código
1. Hacer cambios en el código
2. Reconstruir: `docker-compose build`
3. Reiniciar: `docker-compose up -d`
4. Verificar cambios

### Producción
1. Cambiar contraseñas en `.env`
2. Configurar HTTPS en `nginx.conf`
3. Configurar dominio
4. Iniciar: `docker-compose up -d`
5. Configurar backups automáticos

## 💡 Tips y Mejores Prácticas

1. **Siempre usa volúmenes** para datos importantes
2. **Revisa logs regularmente** con `docker-compose logs`
3. **Haz backups** antes de cambios importantes
4. **Usa .env** para configuración sensible
5. **Documenta cambios** en docker-compose.yml
6. **Prueba en desarrollo** antes de producción
7. **Monitorea recursos** con `docker stats`
8. **Mantén imágenes actualizadas** con `docker-compose pull`

## 🚀 Próximos Pasos

- [ ] Configurar variables de entorno
- [ ] Iniciar servicios
- [ ] Verificar que todo funciona
- [ ] Cambiar contraseñas por defecto
- [ ] Configurar backups
- [ ] Personalizar según necesidades
- [ ] Desplegar en producción (opcional)

## 🆘 Soporte

¿Problemas? Sigue este orden:

1. Revisa logs: `docker-compose logs -f`
2. Verifica estado: `docker-compose ps`
3. Consulta [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
4. Consulta [DOCKER_TEST.md](./DOCKER_TEST.md)
5. Limpia y reinicia: `docker-compose down -v && docker-compose up -d`

---

**¡Listo para desplegar!** 🎉

Ejecuta `.\docker-start.ps1` (Windows) o `./docker-start.sh` (Linux/Mac) para comenzar.
