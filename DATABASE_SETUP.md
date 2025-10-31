# Configuración de Base de Datos PostgreSQL

Este proyecto utiliza PostgreSQL como base de datos. Sigue estos pasos para configurar la base de datos.

## Requisitos Previos

- PostgreSQL 12 o superior instalado en tu sistema
- Acceso a la línea de comandos de PostgreSQL (psql)

## Instalación de PostgreSQL

### Windows
1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Ejecuta el instalador y sigue las instrucciones
3. Anota la contraseña del usuario `postgres` que configures durante la instalación

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### macOS
```bash
brew install postgresql
brew services start postgresql
```

## Configuración de la Base de Datos

### Paso 1: Crear la base de datos

Abre una terminal y ejecuta:

```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Dentro de psql, crear la base de datos
CREATE DATABASE manufactura_db;

# Salir de psql
\q
```

### Paso 2: Inicializar las tablas

Ejecuta el script de inicialización:

```bash
psql -U postgres -d manufactura_db -f database/init.sql
```

O desde psql:

```bash
psql -U postgres -d manufactura_db
\i database/init.sql
```

### Paso 3: Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (copia desde `.env.example`):

```bash
cp .env.example .env
```

2. Edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=manufactura_db
VITE_DB_USER=postgres
VITE_DB_PASSWORD=tu_password_aqui
```

**Nota**: Las variables deben tener el prefijo `VITE_` para ser accesibles en el frontend de Vite.

**IMPORTANTE**: Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

## Verificar la Conexión

Para verificar que la base de datos está correctamente configurada:

```bash
psql -U postgres -d manufactura_db -c "SELECT COUNT(*) FROM users;"
```

Deberías ver que hay 2 usuarios en la base de datos.

## Usuarios por Defecto

El script de inicialización crea dos usuarios:

| Email | Password | Rol |
|-------|----------|-----|
| admin@manufactura.com | admin123 | admin |
| operador@manufactura.com | operador123 | operator |

**IMPORTANTE**: Cambia estas contraseñas en producción.

## Estructura de la Base de Datos

### Tablas

- **users**: Usuarios del sistema
- **production_parameters**: Parámetros de configuración de producción
- **production_data**: Datos históricos de producción
- **predictions**: Predicciones generadas por el sistema

### Relaciones

- `production_parameters.updated_by` → `users.id`
- `production_data.created_by` → `users.id`
- `predictions.created_by` → `users.id`

## Comandos Útiles de PostgreSQL

```bash
# Conectar a la base de datos
psql -U postgres -d manufactura_db

# Listar todas las tablas
\dt

# Ver estructura de una tabla
\d users

# Ver todos los usuarios
SELECT * FROM users;

# Hacer backup de la base de datos
pg_dump -U postgres manufactura_db > backup.sql

# Restaurar desde backup
psql -U postgres -d manufactura_db < backup.sql
```

## Solución de Problemas

### Error: "password authentication failed"
- Verifica que la contraseña en el archivo `.env` sea correcta
- Asegúrate de que el usuario tenga permisos en la base de datos

### Error: "database does not exist"
- Ejecuta el comando CREATE DATABASE nuevamente
- Verifica que el nombre de la base de datos en `.env` sea correcto

### Error: "connection refused"
- Verifica que PostgreSQL esté corriendo: `sudo service postgresql status` (Linux) o revisa los servicios en Windows
- Verifica que el puerto 5432 no esté bloqueado por el firewall

### Error: "relation does not exist"
- Ejecuta el script de inicialización: `psql -U postgres -d manufactura_db -f database/init.sql`

## Mantenimiento

### Limpiar datos de prueba
```sql
TRUNCATE TABLE predictions, production_data RESTART IDENTITY CASCADE;
```

### Resetear la base de datos
```bash
psql -U postgres -c "DROP DATABASE manufactura_db;"
psql -U postgres -c "CREATE DATABASE manufactura_db;"
psql -U postgres -d manufactura_db -f database/init.sql
```
