# Sistema de Autenticación y Mantenedores

## 📋 Resumen

Se ha implementado un sistema completo de autenticación con roles y mantenedores administrativos para el Sistema de Predicción de Producción Manufacturera.

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Autenticación

#### Roles Disponibles
- **Admin**: Acceso completo al sistema, puede gestionar usuarios y tipos de productos
- **Operator**: Gestiona pedidos y producción
- **Customer**: Puede registrarse, hacer pedidos y ver sus propios pedidos

#### Endpoints de Autenticación

**POST /api/auth/register**
- Registro de nuevos usuarios (rol customer por defecto)
- Validación de email y contraseña
- Campos: email, password, full_name, phone (opcional), company (opcional)

**POST /api/auth/login**
- Inicio de sesión
- Retorna token JWT válido por 24 horas
- Campos: email, password

**POST /api/auth/logout**
- Cierre de sesión (requiere autenticación)
- Invalida el token actual

**GET /api/auth/profile**
- Obtener perfil del usuario actual (requiere autenticación)

**PUT /api/auth/profile**
- Actualizar perfil del usuario (requiere autenticación)
- Campos actualizables: full_name, phone, company

**PUT /api/auth/change-password**
- Cambiar contraseña (requiere autenticación)
- Campos: current_password, new_password

### 2. Mantenedores Administrativos

Todos los endpoints de admin requieren autenticación y rol de administrador.

#### Gestión de Usuarios

**GET /api/admin/users**
- Listar todos los usuarios con sus roles

**GET /api/admin/users/:id**
- Obtener detalles de un usuario específico

**PUT /api/admin/users/:id**
- Actualizar usuario (nombre, teléfono, empresa, rol, estado)

**DELETE /api/admin/users/:id**
- Desactivar usuario (soft delete)

#### Gestión de Tipos de Productos

**GET /api/admin/product-types**
- Listar todos los tipos de productos

**POST /api/admin/product-types**
- Crear nuevo tipo de producto
- Campos: name, description, material_type, base_production_time, complexity_factor

**PUT /api/admin/product-types/:id**
- Actualizar tipo de producto existente

**DELETE /api/admin/product-types/:id**
- Eliminar tipo de producto (verifica que no tenga pedidos asociados)

#### Estadísticas y Reportes

**GET /api/admin/dashboard/stats**
- Estadísticas generales del sistema
- Usuarios por rol
- Pedidos por estado
- Actividad reciente

**GET /api/admin/audit/product-types**
- Auditoría de cambios en tipos de productos
- Historial de creación, actualización y eliminación

**GET /api/admin/roles**
- Listar todos los roles disponibles

### 3. Sistema de Pedidos Actualizado

**POST /api/orders** (requiere autenticación)
- Crear nuevo pedido
- Los clientes solo pueden crear pedidos a su nombre
- Admin/Operator pueden crear pedidos para cualquier cliente
- Se asocia automáticamente con el usuario autenticado

**GET /api/orders** (requiere autenticación)
- Listar pedidos
- Los clientes solo ven sus propios pedidos
- Admin/Operator ven todos los pedidos

## 🗄️ Base de Datos

### Nuevas Tablas

**roles**
- id, name, description, created_at

**users** (actualizada)
- Nuevas columnas: password_hash, full_name, phone, company, role_id, is_active, email_verified, updated_at, last_login

**sessions**
- id, user_id, token, expires_at, created_at, ip_address, user_agent

**product_type_audit**
- id, product_type_id, action, changed_by, old_values, new_values, created_at

### Vistas

**users_with_roles**
- Vista que combina usuarios con información de sus roles

## 🔐 Seguridad

- Contraseñas hasheadas con SHA-256 (en producción se recomienda bcrypt)
- Tokens de sesión únicos con expiración de 24 horas
- Middleware de autenticación para rutas protegidas
- Middleware de autorización para rutas de admin
- Validación de datos de entrada
- Auditoría de cambios en tipos de productos

## 📝 Usuarios de Prueba

Después de aplicar la migración, se crea un usuario admin:
- **Email**: admin@manufactura.com
- **Contraseña**: (usar endpoint de registro para crear usuarios con contraseñas reales)

## 🚀 Cómo Usar

### 1. Aplicar Migración

```powershell
.\apply-auth-migration.ps1
```

### 2. Registrar un Usuario

```bash
POST /api/auth/register
{
  "email": "cliente@example.com",
  "password": "password123",
  "full_name": "Juan Pérez",
  "phone": "+51 999 999 999",
  "company": "Mi Empresa SAC"
}
```

### 3. Iniciar Sesión

```bash
POST /api/auth/login
{
  "email": "cliente@example.com",
  "password": "password123"
}
```

Respuesta:
```json
{
  "message": "Login exitoso",
  "token": "abc123...",
  "user": {
    "id": 1,
    "email": "cliente@example.com",
    "full_name": "Juan Pérez",
    "role": "customer"
  }
}
```

### 4. Usar el Token

Incluir en el header de las peticiones:
```
Authorization: Bearer abc123...
```

### 5. Crear un Pedido (como cliente)

```bash
POST /api/orders
Authorization: Bearer abc123...
{
  "product_type_id": 1,
  "quantity": 5,
  "width": 100,
  "height": 200,
  "depth": 50
}
```

### 6. Gestionar Tipos de Productos (como admin)

```bash
POST /api/admin/product-types
Authorization: Bearer admin_token...
{
  "name": "Mesa Ejecutiva",
  "description": "Mesa de oficina ejecutiva",
  "material_type": "Madera",
  "base_production_time": 8.0,
  "complexity_factor": 1.5
}
```

## 🔄 Próximos Pasos

1. **Frontend**:
   - Crear componentes de Login/Registro
   - Crear panel de administración
   - Crear mantenedores de usuarios y productos
   - Actualizar formulario de pedidos para clientes

2. **Mejoras de Seguridad**:
   - Implementar bcrypt para hash de contraseñas
   - Agregar rate limiting
   - Implementar refresh tokens
   - Agregar verificación de email

3. **Funcionalidades Adicionales**:
   - Recuperación de contraseña
   - Notificaciones por email
   - Historial de actividad del usuario
   - Permisos granulares

## 📚 Documentación de API

Todos los endpoints están documentados con:
- Método HTTP
- Ruta
- Autenticación requerida
- Rol requerido
- Parámetros de entrada
- Respuestas posibles

Ver código fuente en:
- `server/routes/auth.ts` - Autenticación
- `server/routes/admin.ts` - Mantenedores administrativos
- `server/routes/orders.ts` - Pedidos (actualizado)
