# 🚀 Inicio Rápido

Guía rápida para poner en marcha el sistema en 5 minutos.

## Paso 1: Instalar PostgreSQL

Si no tienes PostgreSQL instalado:

**Windows**: Descarga desde https://www.postgresql.org/download/windows/

Durante la instalación, anota la contraseña que configures para el usuario `postgres`.

## Paso 2: Instalar dependencias del proyecto

```bash
npm install
```

## Paso 3: Configurar la base de datos

### Opción Automática (Recomendado)

```bash
npm run db:setup
```

Este script:
- Crea el archivo `.env` si no existe
- Crea la base de datos `manufactura_db`
- Inicializa todas las tablas
- Inserta datos de ejemplo

### Opción Manual

1. Verifica que el archivo `.env` tenga tus credenciales correctas
2. Ejecuta:
   ```bash
   psql -U postgres -c "CREATE DATABASE manufactura_db;"
   npm run db:init
   ```

## Paso 4: Iniciar la aplicación

```bash
npm run dev
```

Abre tu navegador en: http://localhost:5173

## Paso 5: Iniciar sesión

Usa uno de estos usuarios:

- **Admin**: admin@manufactura.com / admin123
- **Operador**: operador@manufactura.com / operador123

---

## ¿Problemas?

### PostgreSQL no está corriendo

```bash
# Windows (PowerShell como administrador)
Get-Service postgresql* | Start-Service
```

### Error de autenticación

Verifica que la contraseña en `.env` sea correcta:
```env
VITE_DB_PASSWORD=tu_password_real
```

### La base de datos no existe

```bash
npm run db:setup
```

### Más ayuda

Consulta [DATABASE_SETUP.md](./DATABASE_SETUP.md) para soluciones detalladas.

---

## Próximos pasos

1. ✅ Explora el Dashboard
2. ✅ Agrega datos de producción en "Gestión de Datos"
3. ✅ Genera predicciones en "Predicciones"
4. ✅ Crea reportes en PDF en "Reportes"
5. ✅ Configura parámetros en "Configuración"

¡Disfruta del sistema! 🎉
