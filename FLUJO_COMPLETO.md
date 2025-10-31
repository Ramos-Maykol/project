# 🔄 Flujo Completo del Sistema con n8n

## 📊 Diagrama de Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                                │
│                    (Navegador Web)                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Chatbot    │  │   Solicitar  │  │   Gestión    │              │
│  │  Component   │  │   Producto   │  │   Pedidos    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         │ POST /message   │ POST /estimate   │ PATCH /status        │
└─────────┼─────────────────┼──────────────────┼───────────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express + Node.js)                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  API Routes:                                                    │ │
│  │  • /api/chatbot/message     → Procesa mensajes del chat       │ │
│  │  • /api/orders/estimate     → Calcula tiempo con ML           │ │
│  │  • /api/orders/:id/status   → Actualiza estado pedido         │ │
│  │  • /api/orders/ml/retrain   → Re-entrena modelo               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Machine Learning (RandomForest):                              │ │
│  │  • 100 pedidos históricos                                      │ │
│  │  • Predicción de tiempos                                       │ │
│  │  • Re-entrenamiento automático                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          │ Puede llamar a n8n webhooks
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         n8n WORKFLOWS                                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  WORKFLOW 1: Chatbot Inteligente                              │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ 1. Webhook Chatbot (POST /webhook/chatbot)              │ │ │
│  │  │    ↓                                                      │ │ │
│  │  │ 2. Detectar Intención                                    │ │ │
│  │  │    • Analiza mensaje                                     │ │ │
│  │  │    • Extrae palabras clave                               │ │ │
│  │  │    • Identifica tipo de producto                         │ │ │
│  │  │    • Busca número de orden                               │ │ │
│  │  │    ↓                                                      │ │ │
│  │  │ 3. Decisión: ¿Qué tipo de consulta?                     │ │ │
│  │  │    ├─ Producto Personalizado                             │ │ │
│  │  │    │  • Detecta tipo (lavamanos, mueble, etc.)          │ │ │
│  │  │    │  • Genera respuesta personalizada                   │ │ │
│  │  │    │  • Solicita detalles específicos                    │ │ │
│  │  │    │                                                      │ │ │
│  │  │    ├─ Consulta de Pedido                                 │ │ │
│  │  │    │  • Busca en BD (GET /api/chatbot/order/:num)       │ │ │
│  │  │    │  • Formatea información                             │ │ │
│  │  │    │  • Muestra estado con emojis                        │ │ │
│  │  │    │                                                      │ │ │
│  │  │    └─ Consulta General                                   │ │ │
│  │  │       • Saludo, Ayuda, Tiempo, Precio                    │ │ │
│  │  │       • Respuestas predefinidas                          │ │ │
│  │  │    ↓                                                      │ │ │
│  │  │ 4. Guardar Conversación                                  │ │ │
│  │  │    • POST /api/chatbot/message                           │ │ │
│  │  │    • Almacena en PostgreSQL                              │ │ │
│  │  │    ↓                                                      │ │ │
│  │  │ 5. Responder al Usuario                                  │ │ │
│  │  │    • Retorna JSON con respuesta                          │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  WORKFLOW 2: Notificaciones de Pedidos                       │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ 1. Webhook Pedido (POST /webhook/pedido-actualizado)    │ │ │
│  │  │    ↓                                                      │ │ │
│  │  │ 2. Formatear Notificación                                │ │ │
│  │  │    • Extrae datos del pedido                             │ │ │
│  │  │    • Genera mensaje personalizado                        │ │ │
│  │  │    • Agrega emojis según estado                          │ │ │
│  │  │    ↓                                                      │ │ │
│  │  │ 3. Decisión: ¿Estado = Entregado?                       │ │ │
│  │  │    ├─ SÍ                                                 │ │ │
│  │  │    │  • Re-entrenar Modelo ML                            │ │ │
│  │  │    │  • POST /api/orders/ml/retrain                      │ │ │
│  │  │    │  • Modelo aprende del pedido                        │ │ │
│  │  │    │                                                      │ │ │
│  │  │    └─ NO                                                  │ │ │
│  │  │       • Continuar al siguiente paso                      │ │ │
│  │  │    ↓                                                      │ │ │
│  │  │ 4. Enviar Notificación                                   │ │ │
│  │  │    • Log en consola                                      │ │ │
│  │  │    • (Opcional) Email                                    │ │ │
│  │  │    • (Opcional) SMS                                      │ │ │
│  │  │    ↓                                                      │ │ │
│  │  │ 5. Responder                                             │ │ │
│  │  │    • Confirma procesamiento                              │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Tablas:                                                        │ │
│  │  • users                  → Usuarios del sistema               │ │
│  │  • product_types          → Catálogo de productos (8 tipos)    │ │
│  │  • orders                 → Pedidos (100 históricos + cola)    │ │
│  │  • production_queue       → Cola de producción                 │ │
│  │  • production_capacity    → Capacidad diaria                   │ │
│  │  • chatbot_conversations  → Historial de chat                  │ │
│  │  • production_data        → Datos de producción                │ │
│  │  • predictions            → Predicciones del modelo            │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo 1: Usuario Solicita Producto

```
1. Usuario abre "Solicitar Producto"
   ↓
2. Completa formulario:
   • Tipo de producto
   • Cantidad
   • Dimensiones (opcional)
   • Prioridad
   ↓
3. Click "Calcular Estimación"
   ↓
4. Frontend → POST /api/orders/estimate-delivery
   ↓
5. Backend:
   • Modelo ML predice tiempo
   • Considera cola actual
   • Calcula fecha de entrega
   ↓
6. Retorna estimación al usuario:
   • Tiempo: 18.5 horas
   • Fecha: 5 de octubre
   • Posición en cola: #3
   ↓
7. Usuario confirma pedido
   ↓
8. Frontend → POST /api/orders
   ↓
9. Backend:
   • Crea pedido en BD
   • Genera número de orden
   • Actualiza cola de producción
   ↓
10. Retorna confirmación:
    • Número de orden: ORD-2024-111
    • Estado: Pendiente
```

---

## 💬 Flujo 2: Usuario Usa Chatbot

```
1. Usuario click en botón flotante 💬
   ↓
2. Escribe mensaje: "pueden hacer un lavamanos para niños?"
   ↓
3. Frontend → POST /api/chatbot/message
   ↓
4. Backend procesa mensaje:
   • Detecta intención: "producto_personalizado"
   • Detecta tipo: "lavamanos"
   ↓
5. Genera respuesta personalizada:
   • "¡Por supuesto! Sí podemos elaborar muebles de baño..."
   • Solicita detalles (dimensiones, cantidad, material)
   • Ofrece sugerencias relevantes
   ↓
6. Guarda conversación en BD
   ↓
7. Retorna respuesta al usuario
   ↓
8. Usuario ve respuesta en el chat
```

**Alternativa con n8n**:
```
3. Frontend → POST http://localhost:5678/webhook/chatbot
   ↓
4. n8n Workflow:
   • Nodo 1: Recibe mensaje
   • Nodo 2: Detecta intención
   • Nodo 3: Decide flujo (producto/pedido/general)
   • Nodo 4: Genera respuesta
   • Nodo 5: Guarda en BD
   • Nodo 6: Responde
```

---

## 📦 Flujo 3: Operador Gestiona Pedido

```
1. Operador accede a "Gestión de Pedidos"
   ↓
2. Ve lista de pedidos:
   • Pendientes: 8
   • En Producción: 2
   ↓
3. Selecciona pedido pendiente
   ↓
4. Click "Iniciar Producción" ▶️
   ↓
5. Frontend → PATCH /api/orders/:id/status
   Body: { status: "in_progress" }
   ↓
6. Backend:
   • Actualiza estado en BD
   • Registra fecha de inicio
   ↓
7. (Opcional) Llama a n8n webhook:
   POST /webhook/pedido-actualizado
   ↓
8. n8n Workflow:
   • Formatea notificación
   • Envía notificación al cliente
   ↓
9. Producción termina
   ↓
10. Operador click "Completar" ✅
    ↓
11. Frontend → PATCH /api/orders/:id/status
    Body: { status: "completed" }
    ↓
12. Cliente recoge producto
    ↓
13. Operador click "Entregar" 🚚
    ↓
14. Frontend → PATCH /api/orders/:id/status
    Body: { status: "delivered" }
    ↓
15. Backend:
    • Actualiza estado
    • Registra fecha de entrega
    • 🎓 RE-ENTRENA MODELO ML automáticamente
    ↓
16. Modelo ML mejora su precisión
```

---

## 🤖 Flujo 4: Re-entrenamiento Automático del Modelo

```
1. Pedido marcado como "Entregado"
   ↓
2. Backend detecta cambio de estado
   ↓
3. Llama a predictionModel.retrain()
   ↓
4. Modelo ML:
   • Consulta pedidos entregados en BD
   • Extrae features (tipo, cantidad, dimensiones, etc.)
   • Extrae labels (tiempo real de producción)
   • Divide datos 80/20 (entrenamiento/prueba)
   • Entrena RandomForest con 50 árboles
   • Calcula nueva precisión
   ↓
5. Modelo actualizado y listo
   ↓
6. Próximas predicciones serán más precisas
```

---

## 📊 Flujo 5: Consulta de Pedido por Chatbot

```
1. Usuario en chatbot escribe:
   "estado del pedido ORD-2024-101"
   ↓
2. Backend detecta número de orden
   ↓
3. Busca en BD:
   SELECT * FROM orders WHERE order_number = 'ORD-2024-101'
   ↓
4. Encuentra pedido:
   • Cliente: Felipe Moreno
   • Producto: Mueble Estándar
   • Estado: En Producción
   • Tiempo estimado: 17.2h
   ↓
5. Formatea respuesta con emojis:
   🔨 Pedido ORD-2024-101
   👤 Cliente: Felipe Moreno
   📦 Producto: Mueble Estándar
   ...
   ↓
6. Retorna al usuario
   ↓
7. Usuario ve información completa
```

---

## 🎯 Puntos Clave de Integración

### **1. Backend ↔ n8n**
- Backend puede llamar a webhooks de n8n
- n8n puede llamar a endpoints del backend
- Comunicación bidireccional

### **2. Frontend ↔ Backend**
- REST API con JSON
- Autenticación con contexto
- Manejo de errores

### **3. Backend ↔ PostgreSQL**
- Pool de conexiones
- Queries optimizadas
- Transacciones cuando necesario

### **4. ML ↔ Base de Datos**
- Modelo lee datos históricos
- Se re-entrena automáticamente
- Mejora continua

---

## 🚀 Comandos para Iniciar Todo

```bash
# Opción 1: Todo en uno
npm run dev:all

# Esto inicia:
# - Backend API (puerto 3000)
# - Frontend React (puerto 5173)
# - n8n (puerto 5678)
```

---

## 📝 URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Interfaz de usuario |
| Backend API | http://localhost:3000 | API REST |
| n8n | http://localhost:5678 | Workflows |
| PostgreSQL | localhost:5432 | Base de datos |

---

## 🎊 Sistema Completo

**Componentes Integrados**:
- ✅ Frontend React con TypeScript
- ✅ Backend Express con Node.js
- ✅ PostgreSQL con 100+ pedidos
- ✅ Machine Learning (RandomForest)
- ✅ Chatbot IA Fase 2
- ✅ n8n Workflows
- ✅ Gestión de pedidos completa
- ✅ Re-entrenamiento automático

**Todo funcionando en conjunto** para un sistema de manufactura inteligente y automatizado! 🎉
