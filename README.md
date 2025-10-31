# Sistema de Predicción de Producción Manufacturera

Sistema web para la gestión y predicción de producción en entornos manufactureros, desarrollado con React, TypeScript y PostgreSQL.

## 🚀 Características

- **Autenticación de usuarios** con roles (Admin/Operador)
- **Dashboard interactivo** con métricas en tiempo real
- **Gestión de datos de producción** con validación
- **Predicciones basadas en datos históricos**
- **Generación de reportes** en PDF
- **Base de datos PostgreSQL** para persistencia de datos

## 📋 Requisitos Previos

### Opción 1: Despliegue con Docker (Recomendado) 🐳
- Docker Desktop instalado
- Docker Compose
- 4GB RAM disponible

### Opción 2: Instalación Manual
- Node.js 18+ y npm
- PostgreSQL 12+
- Git

## 🔧 Instalación

### 🐳 Opción A: Despliegue con Docker (Recomendado)

La forma más rápida de ejecutar el sistema completo:

```bash
# 1. Copiar variables de entorno
cp .env.docker .env

# 2. Iniciar todos los servicios
docker-compose up -d

# 3. Acceder a la aplicación
# http://localhost (Aplicación principal)
# http://localhost/n8n (n8n para automatización)
```

**📖 Para más detalles, consulta [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)**

### 💻 Opción B: Instalación Manual

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd project
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar PostgreSQL

#### Opción A: Script automático (Windows)

```bash
npm run db:setup
```

#### Opción B: Configuración manual

1. Crea un archivo `.env` desde `.env.example`:
   ```bash
   copy .env.example .env
   ```

2. Edita `.env` con tus credenciales de PostgreSQL:
   ```env
   VITE_DB_HOST=localhost
   VITE_DB_PORT=5432
   VITE_DB_NAME=manufactura_db
   VITE_DB_USER=postgres
   VITE_DB_PASSWORD=tu_password
   ```
   
   **Nota**: Las variables deben tener el prefijo `VITE_` para Vite.

3. Crea la base de datos:
   ```bash
   psql -U postgres -c "CREATE DATABASE manufactura_db;"
   ```

4. Inicializa las tablas:
   ```bash
   npm run db:init
   ```

Para más detalles, consulta [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## 🎯 Uso

### Iniciar el sistema completo (Backend + Frontend)

```bash
npm run dev:full
```

Esto iniciará:
- **Backend API**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`

### O iniciar por separado

```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Usuarios por defecto

| Email | Password | Rol |
|-------|----------|-----|
| admin@manufactura.com | admin123 | Administrador |
| operador@manufactura.com | operador123 | Operador |

⚠️ **Importante**: Cambia estas contraseñas en producción.

## 🏗️ Estructura del Proyecto

```
project/
├── database/
│   └── init.sql              # Script de inicialización de BD
├── src/
│   ├── components/           # Componentes React
│   ├── contexts/            # Contextos de React (Auth, etc.)
│   ├── database/            # Configuración y manager de BD
│   │   ├── config.ts        # Configuración de PostgreSQL
│   │   └── index.ts         # DatabaseManager
│   ├── types/               # Tipos TypeScript
│   └── utils/               # Utilidades
├── .env.example             # Plantilla de variables de entorno
├── DATABASE_SETUP.md        # Guía detallada de configuración de BD
└── package.json
```

## 📊 Base de Datos

### Tablas principales

- **users**: Gestión de usuarios y autenticación
- **production_parameters**: Parámetros de configuración
- **production_data**: Datos históricos de producción
- **predictions**: Predicciones generadas

### Comandos útiles

```bash
# Reinicializar la base de datos
npm run db:init

# Conectar a la base de datos
psql -U postgres -d manufactura_db

# Hacer backup
pg_dump -U postgres manufactura_db > backup.sql
```

## 🛠️ Scripts Disponibles

- `npm run dev:full` - Inicia backend + frontend simultáneamente
- `npm run server` - Inicia solo el servidor backend (puerto 3000)
- `npm run dev` - Inicia solo el frontend (puerto 5173)
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter
- `npm run db:setup` - Configura la base de datos (Windows)
- `npm run db:init` - Inicializa las tablas de la base de datos

## 🔒 Seguridad

- Las contraseñas se almacenan en texto plano (⚠️ **solo para desarrollo**)
- El archivo `.env` está en `.gitignore` y no debe subirse a Git
- Para producción, implementa:
  - Hash de contraseñas (bcrypt)
  - JWT para autenticación
  - HTTPS
  - Variables de entorno seguras

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux
   sudo service postgresql status
   ```

2. Verifica las credenciales en `.env`

3. Verifica que el puerto 5432 no esté bloqueado

### Error "relation does not exist"

Ejecuta el script de inicialización:
```bash
npm run db:init
```

### Más información

Consulta [DATABASE_SETUP.md](./DATABASE_SETUP.md) para soluciones detalladas.

## 📝 Tecnologías

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Node.js con pg (PostgreSQL client)
- **Base de Datos**: PostgreSQL
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Build Tool**: Vite

## 📄 Licencia

Este proyecto es privado y está destinado solo para uso educativo/interno.

## 👥 Contribuir

1. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
2. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abre un Pull Request

## 📧 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
