# Arquitectura del Sistema

## 📐 Diseño General

El sistema utiliza una arquitectura cliente-servidor con las siguientes capas:

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│         Puerto: 5173                    │
│  - Componentes UI                       │
│  - Gestión de estado (Context API)     │
│  - Cliente API REST                     │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
               │
┌──────────────▼──────────────────────────┐
│      Backend API (Express + Node.js)    │
│         Puerto: 3000                    │
│  - Rutas REST                           │
│  - Lógica de negocio                   │
│  - Validación de datos                 │
└──────────────┬──────────────────────────┘
               │ pg (node-postgres)
               │
┌──────────────▼──────────────────────────┐
│      Base de Datos (PostgreSQL)         │
│         Puerto: 5432                    │
│  - Tablas relacionales                  │
│  - Índices                              │
│  - Triggers y funciones                 │
└─────────────────────────────────────────┘
```

## 🔧 Tecnologías

### Frontend
- **React 18**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **TailwindCSS**: Estilos
- **Recharts**: Gráficos
- **Lucide React**: Iconos

### Backend
- **Node.js**: Runtime
- **Express**: Framework web
- **TypeScript**: Tipado estático
- **pg**: Cliente PostgreSQL
- **cors**: Middleware CORS
- **tsx**: Ejecución TypeScript

### Base de Datos
- **PostgreSQL 18**: Base de datos relacional

## 📁 Estructura de Archivos

```
project/
├── src/                          # Frontend
│   ├── api/
│   │   └── client.ts            # Cliente API REST
│   ├── components/              # Componentes React
│   │   ├── Dashboard.tsx
│   │   ├── DataManagement.tsx
│   │   ├── Predictions.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticación
│   ├── database/
│   │   └── index.ts             # Manager de DB (usa API)
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   └── App.tsx                  # Componente principal
│
├── server/                       # Backend
│   ├── database/
│   │   └── config.ts            # Configuración PostgreSQL
│   ├── routes/                  # Rutas API
│   │   ├── auth.ts              # Autenticación
│   │   ├── production.ts        # Datos de producción
│   │   ├── predictions.ts       # Predicciones
│   │   └── parameters.ts        # Parámetros
│   └── index.ts                 # Servidor Express
│
├── database/
│   └── init.sql                 # Script de inicialización
│
├── .env                         # Variables de entorno (no en Git)
├── .env.example                 # Plantilla de variables
├── package.json                 # Dependencias
└── vite.config.ts              # Configuración Vite
```

## 🔄 Flujo de Datos

### 1. Autenticación
```
Usuario → LoginForm → apiClient.login() → POST /api/auth/login → PostgreSQL
                                                ↓
                                            Retorna User
                                                ↓
                                          AuthContext actualiza
                                                ↓
                                          Usuario autenticado
```

### 2. Consulta de Datos
```
Componente → db.getProductionData() → apiClient.getProductionData()
                                            ↓
                                    GET /api/production/data
                                            ↓
                                    SELECT * FROM production_data
                                            ↓
                                    Convierte tipos (parseFloat)
                                            ↓
                                    Retorna JSON
                                            ↓
                                    Componente renderiza
```

### 3. Inserción de Datos
```
Formulario → db.insertProductionData() → apiClient.insertProductionData()
                                              ↓
                                      POST /api/production/data
                                              ↓
                                      INSERT INTO production_data
                                              ↓
                                      RETURNING id
                                              ↓
                                      Retorna nuevo registro
                                              ↓
                                      Actualiza UI
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Producción
- `GET /api/production/data` - Obtener todos los datos
- `POST /api/production/data` - Insertar nuevo dato
- `GET /api/production/trends?days=30` - Obtener tendencias
- `GET /api/production/efficiency-metrics` - Métricas de eficiencia

### Predicciones
- `GET /api/predictions` - Obtener todas las predicciones
- `POST /api/predictions` - Crear nueva predicción

### Parámetros
- `GET /api/parameters` - Obtener todos los parámetros
- `PUT /api/parameters/:id` - Actualizar parámetro

### Salud
- `GET /api/health` - Verificar estado del servidor

## 🗄️ Esquema de Base de Datos

### Tabla: users
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password        VARCHAR(255) NOT NULL
role            VARCHAR(50) NOT NULL
name            VARCHAR(255) NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tabla: production_parameters
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
value           NUMERIC(10, 2) NOT NULL
unit            VARCHAR(50) NOT NULL
category        VARCHAR(100) NOT NULL
updated_by      INTEGER REFERENCES users(id)
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tabla: production_data
```sql
id                          SERIAL PRIMARY KEY
raw_material_available      NUMERIC(10, 2) NOT NULL
standard_process_time       NUMERIC(10, 2) NOT NULL
projected_demand            NUMERIC(10, 2) NOT NULL
actual_production           NUMERIC(10, 2)
efficiency_rate             NUMERIC(5, 2)
date                        DATE NOT NULL
created_by                  INTEGER REFERENCES users(id)
created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tabla: predictions
```sql
id                          SERIAL PRIMARY KEY
raw_material_available      NUMERIC(10, 2) NOT NULL
standard_process_time       NUMERIC(10, 2) NOT NULL
projected_demand            NUMERIC(10, 2) NOT NULL
predicted_production        NUMERIC(10, 2) NOT NULL
confidence_level            NUMERIC(5, 2) NOT NULL
prediction_date             DATE NOT NULL
created_by                  INTEGER REFERENCES users(id)
created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🚀 Ejecución

### Desarrollo
```bash
# Iniciar ambos servidores (backend + frontend)
npm run dev:full

# O iniciar por separado:
npm run server    # Backend en puerto 3000
npm run dev       # Frontend en puerto 5173
```

### Producción
```bash
# Build del frontend
npm run build

# Iniciar servidor
npm run server
```

## 🔒 Seguridad

### Actual (Desarrollo)
- ⚠️ Contraseñas en texto plano
- ⚠️ Sin autenticación JWT
- ⚠️ CORS abierto

### Recomendado (Producción)
- ✅ Hash de contraseñas con bcrypt
- ✅ JWT para sesiones
- ✅ CORS restrictivo
- ✅ HTTPS
- ✅ Rate limiting
- ✅ Validación de entrada
- ✅ SQL injection protection (ya implementado con queries parametrizadas)

## 📊 Conversión de Tipos

PostgreSQL retorna valores NUMERIC como strings. El backend convierte automáticamente:

```typescript
const data = result.rows.map((row: any) => ({
  ...row,
  value: parseFloat(row.value),
  efficiency_rate: parseFloat(row.efficiency_rate),
  // ... otros campos numéricos
}));
```

Esto asegura que el frontend reciba números y pueda usar métodos como `.toFixed()`.

## 🔍 Debugging

### Verificar conexión a BD
```bash
curl http://localhost:3000/api/health
```

### Ver logs del servidor
Los logs aparecen en la terminal donde ejecutaste `npm run server`

### Inspeccionar requests
Usa las DevTools del navegador → Network tab

## 📝 Notas

- El frontend NO se conecta directamente a PostgreSQL
- Toda comunicación con la BD pasa por la API REST
- Los tipos TypeScript aseguran consistencia entre frontend y backend
- Las variables de entorno usan prefijo `VITE_` para ser accesibles en Vite
