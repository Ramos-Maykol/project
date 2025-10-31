# 🧪 Pruebas de Despliegue Docker

## Guía de Pruebas Paso a Paso

### 1. Preparación

```bash
# Asegúrate de estar en el directorio del proyecto
cd "e:\tesis 2\bolt new\project"

# Verifica que Docker esté corriendo
docker --version
docker-compose --version
```

### 2. Configuración Inicial

```bash
# Windows PowerShell
Copy-Item .env.docker .env

# Linux/Mac
cp .env.docker .env
```

### 3. Iniciar el Sistema

**Opción A: Script automático**
```bash
# Windows
.\docker-start.ps1

# Linux/Mac
chmod +x docker-start.sh
./docker-start.sh
```

**Opción B: Manual**
```bash
docker-compose up -d
```

### 4. Verificar Servicios

```bash
# Windows
.\verify-docker.ps1

# Linux/Mac
chmod +x verify-docker.sh
./verify-docker.sh
```

### 5. Pruebas Funcionales

#### 5.1 Verificar PostgreSQL

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d manufactura_db

# Dentro de psql, ejecutar:
\dt                           # Listar tablas
SELECT * FROM users LIMIT 5;  # Ver usuarios
\q                            # Salir
```

#### 5.2 Verificar API Backend

```bash
# Health check
curl http://localhost:3000/api/health

# O en PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
```

Respuesta esperada:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-02T23:24:00.000Z"
}
```

#### 5.3 Verificar Frontend

Abre tu navegador en: http://localhost

**Pruebas:**
- ✅ La página carga correctamente
- ✅ Puedes ver el formulario de login
- ✅ No hay errores en la consola del navegador

**Credenciales de prueba:**
- Email: `admin@manufactura.com`
- Password: `admin123`

#### 5.4 Verificar n8n

Abre tu navegador en: http://localhost/n8n

**Credenciales por defecto:**
- Usuario: `admin`
- Password: `admin123`

**Pruebas:**
- ✅ La interfaz de n8n carga
- ✅ Puedes iniciar sesión
- ✅ Los workflows están disponibles

### 6. Pruebas de Logs

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs app
docker-compose logs postgres
docker-compose logs n8n
docker-compose logs nginx
```

### 7. Pruebas de Persistencia

#### 7.1 Crear datos de prueba

1. Inicia sesión en la aplicación
2. Crea algunos registros de producción
3. Detén los contenedores:
   ```bash
   docker-compose down
   ```

#### 7.2 Verificar persistencia

1. Reinicia los contenedores:
   ```bash
   docker-compose up -d
   ```
2. Inicia sesión nuevamente
3. ✅ Los datos deben seguir ahí

### 8. Pruebas de Rendimiento

```bash
# Ver uso de recursos
docker stats

# Ver recursos de un contenedor específico
docker stats manufactura-app
```

### 9. Pruebas de Red

```bash
# Verificar que los contenedores estén en la misma red
docker network ls
docker network inspect project_manufactura-network
```

### 10. Pruebas de Volúmenes

```bash
# Listar volúmenes
docker volume ls | grep project

# Inspeccionar volumen de PostgreSQL
docker volume inspect project_postgres_data

# Inspeccionar volumen de n8n
docker volume inspect project_n8n_data
```

## 🔧 Pruebas de Recuperación

### Backup de Base de Datos

```bash
# Crear backup
docker-compose exec postgres pg_dump -U postgres manufactura_db > backup_test.sql

# Verificar que el archivo se creó
ls -lh backup_test.sql
```

### Restaurar Base de Datos

```bash
# Restaurar desde backup
docker-compose exec -T postgres psql -U postgres -d manufactura_db < backup_test.sql
```

### Reinicio de Servicios

```bash
# Reiniciar un servicio específico
docker-compose restart app

# Reiniciar todos los servicios
docker-compose restart

# Verificar que todo sigue funcionando
.\verify-docker.ps1  # Windows
./verify-docker.sh   # Linux/Mac
```

## 🐛 Pruebas de Errores Comunes

### Error: Puerto en uso

```bash
# Cambiar puerto en docker-compose.yml
# Ejemplo: cambiar 80:80 a 8080:80

# Reiniciar
docker-compose down
docker-compose up -d
```

### Error: Base de datos no conecta

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar estado
docker-compose ps postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Error: Frontend no carga

```bash
# Reconstruir la imagen
docker-compose build --no-cache app
docker-compose up -d app

# Ver logs
docker-compose logs app
```

## ✅ Checklist de Pruebas

- [ ] Docker está instalado y corriendo
- [ ] Archivo .env está configurado
- [ ] Todos los servicios iniciaron correctamente
- [ ] PostgreSQL responde a conexiones
- [ ] API Backend responde en /api/health
- [ ] Frontend carga en http://localhost
- [ ] n8n es accesible en http://localhost/n8n
- [ ] Puedes iniciar sesión en la aplicación
- [ ] Los datos persisten después de reiniciar
- [ ] Los logs son accesibles
- [ ] Los backups funcionan correctamente
- [ ] Los volúmenes están creados
- [ ] La red Docker está configurada

## 📊 Resultados Esperados

Al finalizar todas las pruebas, deberías tener:

1. ✅ 4 contenedores corriendo (app, postgres, n8n, nginx)
2. ✅ 2 volúmenes persistentes (postgres_data, n8n_data)
3. ✅ 1 red Docker (manufactura-network)
4. ✅ Aplicación accesible en http://localhost
5. ✅ API funcionando correctamente
6. ✅ n8n configurado y funcionando
7. ✅ Datos persistiendo entre reinicios

## 🚨 Problemas Conocidos

### Windows: Error de permisos

Si encuentras errores de permisos en Windows:
```bash
# Ejecutar PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Linux: Error de permisos de Docker

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión
```

### Mac: Docker Desktop no inicia

1. Reinicia Docker Desktop
2. Verifica que tienes suficiente RAM asignada (mínimo 4GB)
3. Verifica espacio en disco

## 📝 Notas Adicionales

- Los primeros inicios pueden tardar más mientras se descargan las imágenes
- PostgreSQL puede tardar 10-15 segundos en estar completamente listo
- n8n puede tardar 20-30 segundos en iniciar completamente
- Si cambias código, necesitas reconstruir: `docker-compose build`

## 🆘 Soporte

Si alguna prueba falla:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Consulta DOCKER_DEPLOYMENT.md para soluciones detalladas
4. Intenta limpiar y reiniciar:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```
