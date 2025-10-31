# ✅ Checklist de Despliegue Docker

## Pre-requisitos

- [ ] Docker Desktop instalado
- [ ] Docker Desktop está corriendo
- [ ] Tienes al menos 4GB de RAM disponible
- [ ] Puertos 80, 3000, 5432, 5678 están libres
- [ ] Tienes al menos 2GB de espacio en disco

## Configuración Inicial

- [ ] Clonaste el repositorio
- [ ] Estás en el directorio del proyecto
- [ ] Copiaste `.env.docker` a `.env`
- [ ] Revisaste las variables de entorno en `.env`
- [ ] (Opcional) Cambiaste las contraseñas por defecto

## Archivos Docker

- [ ] `Dockerfile` existe
- [ ] `docker-compose.yml` existe
- [ ] `.dockerignore` existe
- [ ] `nginx.conf` existe
- [ ] `.env` existe (copiado desde `.env.docker`)

## Primer Inicio

- [ ] Ejecutaste `docker-compose up -d`
- [ ] No hubo errores durante el inicio
- [ ] Esperaste al menos 30 segundos para que todo inicie
- [ ] Ejecutaste `docker-compose ps` y todos los servicios están "Up"

## Verificación de Servicios

### PostgreSQL
- [ ] Contenedor `manufactura-db` está corriendo
- [ ] Puerto 5432 está expuesto
- [ ] Healthcheck está pasando
- [ ] Puedes conectarte: `docker-compose exec postgres psql -U postgres`
- [ ] Base de datos `manufactura_db` existe
- [ ] Base de datos `n8n` existe
- [ ] Tablas fueron creadas correctamente

### Aplicación (Frontend + Backend)
- [ ] Contenedor `manufactura-app` está corriendo
- [ ] Puerto 3000 está expuesto
- [ ] API responde: http://localhost:3000/api/health
- [ ] Respuesta JSON es correcta
- [ ] Database status es "connected"
- [ ] No hay errores en los logs: `docker-compose logs app`

### n8n
- [ ] Contenedor `manufactura-n8n` está corriendo
- [ ] Puerto 5678 está expuesto
- [ ] n8n responde: http://localhost:5678
- [ ] Puedes ver la página de login
- [ ] Puedes iniciar sesión con credenciales por defecto
- [ ] Workflows están disponibles (si los tienes)

### Nginx
- [ ] Contenedor `manufactura-nginx` está corriendo
- [ ] Puerto 80 está expuesto
- [ ] Nginx responde: http://localhost
- [ ] Frontend carga correctamente
- [ ] No hay errores 502/503/504
- [ ] Proxy a `/api/*` funciona
- [ ] Proxy a `/n8n/` funciona

## Verificación de Red

- [ ] Red `manufactura-network` existe
- [ ] Todos los contenedores están en la misma red
- [ ] Los contenedores pueden comunicarse entre sí

## Verificación de Volúmenes

- [ ] Volumen `postgres_data` existe
- [ ] Volumen `n8n_data` existe
- [ ] Los volúmenes persisten datos entre reinicios

## Pruebas Funcionales

### Login y Autenticación
- [ ] Puedes acceder a http://localhost
- [ ] Ves el formulario de login
- [ ] Puedes iniciar sesión con `admin@manufactura.com / admin123`
- [ ] Después de login, ves el dashboard
- [ ] No hay errores en la consola del navegador

### Dashboard
- [ ] El dashboard carga correctamente
- [ ] Los gráficos se muestran
- [ ] Los datos se cargan desde la base de datos
- [ ] No hay errores de API

### n8n
- [ ] Puedes acceder a http://localhost/n8n
- [ ] Puedes iniciar sesión con `admin / admin123`
- [ ] La interfaz de n8n carga correctamente
- [ ] Puedes ver/crear workflows

## Pruebas de Persistencia

- [ ] Creaste datos de prueba en la aplicación
- [ ] Ejecutaste `docker-compose down`
- [ ] Ejecutaste `docker-compose up -d`
- [ ] Los datos siguen presentes después de reiniciar

## Pruebas de Logs

- [ ] `docker-compose logs` muestra logs de todos los servicios
- [ ] `docker-compose logs -f` muestra logs en tiempo real
- [ ] No hay errores críticos en los logs
- [ ] Los logs son legibles y útiles

## Pruebas de Backup

- [ ] Puedes crear backup: `docker-compose exec postgres pg_dump -U postgres manufactura_db > backup.sql`
- [ ] El archivo `backup.sql` se creó correctamente
- [ ] El archivo tiene contenido (no está vacío)
- [ ] (Opcional) Probaste restaurar el backup

## Pruebas de Rendimiento

- [ ] `docker stats` muestra uso de recursos razonable
- [ ] Ningún contenedor usa >80% de CPU constantemente
- [ ] Ningún contenedor usa >80% de memoria asignada
- [ ] La aplicación responde rápidamente (<2 segundos)

## Seguridad (Desarrollo)

- [ ] Archivo `.env` está en `.gitignore`
- [ ] No hay credenciales hardcodeadas en el código
- [ ] Las contraseñas por defecto son aceptables para desarrollo

## Seguridad (Producción)

- [ ] Cambiaste TODAS las contraseñas en `.env`
- [ ] Configuraste HTTPS/SSL
- [ ] Actualizaste `nginx.conf` con tu dominio
- [ ] Configuraste firewall
- [ ] Cerraste puertos innecesarios
- [ ] Configuraste backups automáticos
- [ ] Implementaste monitoreo
- [ ] Revisaste logs de seguridad

## Documentación

- [ ] Leíste `DOCKER_README.md`
- [ ] Leíste `DOCKER_QUICKSTART.md`
- [ ] Consultaste `DOCKER_DEPLOYMENT.md` si tuviste problemas
- [ ] Conoces los comandos básicos de Docker Compose
- [ ] Sabes cómo ver logs
- [ ] Sabes cómo hacer backups

## Scripts de Utilidad

- [ ] Probaste `docker-start.ps1` (Windows) o `docker-start.sh` (Linux/Mac)
- [ ] Probaste `verify-docker.ps1` (Windows) o `verify-docker.sh` (Linux/Mac)
- [ ] Los scripts funcionan correctamente
- [ ] Entiendes qué hace cada script

## Limpieza y Mantenimiento

- [ ] Sabes cómo detener servicios: `docker-compose down`
- [ ] Sabes cómo reiniciar servicios: `docker-compose restart`
- [ ] Sabes cómo reconstruir: `docker-compose build`
- [ ] Sabes cómo limpiar: `docker-compose down -v`
- [ ] Sabes cómo ver uso de disco: `docker system df`

## Troubleshooting

- [ ] Sabes cómo ver logs de errores
- [ ] Sabes cómo reiniciar un servicio específico
- [ ] Sabes cómo verificar healthchecks
- [ ] Sabes cómo conectarte a un contenedor
- [ ] Consultaste `DOCKER_DEPLOYMENT.md` para soluciones

## Finalización

- [ ] Todos los servicios están corriendo
- [ ] Todas las pruebas pasaron
- [ ] No hay errores en los logs
- [ ] La aplicación es accesible y funcional
- [ ] Los datos persisten correctamente
- [ ] Tienes backups configurados (producción)
- [ ] Documentaste cualquier cambio que hiciste

## Notas Adicionales

Usa este espacio para notas personales:

```
Fecha de despliegue: _______________
Versión: _______________
Cambios realizados:
- 
- 
- 

Problemas encontrados:
- 
- 
- 

Soluciones aplicadas:
- 
- 
- 
```

---

## 🎉 ¡Felicidades!

Si completaste todos los items, tu sistema está correctamente desplegado con Docker.

**Próximos pasos:**
1. Personaliza según tus necesidades
2. Configura backups automáticos
3. Implementa monitoreo
4. Despliega en producción (si aplica)

**Comandos de referencia rápida:**
```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Ver logs
docker-compose logs -f

# Verificar
.\verify-docker.ps1  # Windows
./verify-docker.sh   # Linux/Mac

# Backup
docker-compose exec postgres pg_dump -U postgres manufactura_db > backup.sql
```

**¿Necesitas ayuda?**
- Consulta `DOCKER_DEPLOYMENT.md`
- Revisa `DOCKER_TEST.md`
- Ejecuta `docker-compose logs -f`
