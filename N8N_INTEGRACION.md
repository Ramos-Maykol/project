# 🔄 Integración con n8n - Documentación Completa

## ✅ n8n Integrado

El sistema ahora está completamente integrado con **n8n** para automatización de workflows y procesamiento inteligente de mensajes.

---

## 🎯 Arquitectura de Integración

```
┌──────────────────────────────────────────────────────┐
│                  USUARIO                             │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│            FRONTEND (React)                          │
│  - Chatbot Component                                 │
│  - Gestión de Pedidos                                │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│         BACKEND API (Express)                        │
│  - /api/chatbot/message                              │
│  - /api/orders/*                                     │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│              n8n WORKFLOWS                           │
│  ┌────────────────────────────────────────────────┐  │
│  │  Workflow 1: Chatbot Inteligente               │  │
│  │  - Webhook: /webhook/chatbot                   │  │
│  │  - Detectar intención                          │  │
│  │  - Procesar mensaje                            │  │
│  │  - Generar respuesta                           │  │
│  │  - Guardar conversación                        │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │  Workflow 2: Notificaciones de Pedidos        │  │
│  │  - Webhook: /webhook/pedido-actualizado       │  │
│  │  - Formatear notificación                     │  │
│  │  - Re-entrenar modelo ML (si entregado)       │  │
│  │  - Enviar notificación                        │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│           PostgreSQL Database                        │
│  - chatbot_conversations                             │
│  - orders                                            │
│  - production_data                                   │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Iniciar el Sistema Completo

### **Opción 1: Todo en uno**
```bash
npm run dev:all
```
Esto inicia:
- ✅ Backend API (puerto 3000)
- ✅ Frontend (puerto 5173)
- ✅ n8n (puerto 5678)

### **Opción 2: Por separado**
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev

# Terminal 3: n8n
npm run n8n
```

---

## 📋 Workflow 1: Chatbot Inteligente

### **Descripción**:
Procesa mensajes del chatbot con lógica avanzada de detección de intenciones.

### **Webhook URL**:
```
POST http://localhost:5678/webhook/chatbot
```

### **Flujo del Workflow**:

```
1. Webhook Chatbot
   ↓
2. Detectar Intención
   ├─ Analiza el mensaje
   ├─ Identifica palabras clave
   ├─ Extrae número de orden (si existe)
   └─ Determina tipo de producto
   ↓
3. ¿Es Producto Personalizado?
   ├─ SÍ → Respuesta Producto
   │        ├─ Detecta tipo (lavamanos, mueble, puerta, etc.)
   │        ├─ Genera respuesta personalizada
   │        └─ Solicita detalles específicos
   │
   └─ NO → ¿Es Consulta de Pedido?
            ├─ SÍ → Buscar Pedido en BD
            │        ├─ GET /api/chatbot/order/:number
            │        ├─ Formatear información
            │        └─ Mostrar estado con emojis
            │
            └─ NO → Respuesta General
                     ├─ Saludo
                     ├─ Ayuda
                     ├─ Tiempo
                     ├─ Precio
                     └─ General
   ↓
4. Guardar Conversación
   ├─ POST /api/chatbot/message
   └─ Almacena en PostgreSQL
   ↓
5. Responder al Usuario
   └─ Retorna JSON con respuesta
```

### **Nodos del Workflow**:

1. **Webhook Chatbot**
   - Tipo: `n8n-nodes-base.webhook`
   - Método: POST
   - Path: `/chatbot`

2. **Detectar Intención**
   - Tipo: `n8n-nodes-base.function`
   - Lógica: JavaScript para análisis de texto
   - Salida: intent, productType, orderNumber

3. **¿Es Producto?**
   - Tipo: `n8n-nodes-base.if`
   - Condición: `intent === 'producto_personalizado'`

4. **Respuesta Producto**
   - Tipo: `n8n-nodes-base.function`
   - Genera respuesta personalizada por tipo

5. **¿Es Consulta Pedido?**
   - Tipo: `n8n-nodes-base.if`
   - Condición: `intent === 'consulta_pedido'`

6. **Buscar Pedido**
   - Tipo: `n8n-nodes-base.httpRequest`
   - URL: `http://localhost:3000/api/chatbot/order/{{orderNumber}}`

7. **Formatear Pedido**
   - Tipo: `n8n-nodes-base.function`
   - Formatea respuesta con emojis y datos

8. **Respuesta General**
   - Tipo: `n8n-nodes-base.function`
   - Respuestas para: saludo, ayuda, tiempo, precio

9. **Guardar Conversación**
   - Tipo: `n8n-nodes-base.httpRequest`
   - POST a `/api/chatbot/message`

10. **Responder al Usuario**
    - Tipo: `n8n-nodes-base.respondToWebhook`
    - Retorna JSON

### **Ejemplo de Uso**:

**Request**:
```json
POST http://localhost:5678/webhook/chatbot
{
  "message": "pueden elaborar un lavamanos para niños?",
  "userId": 1
}
```

**Response**:
```json
{
  "response": "¡Por supuesto! 😊 Sí podemos elaborar muebles de baño personalizados...",
  "timestamp": "2024-10-01T02:50:00.000Z",
  "intent": "producto_personalizado",
  "action": "solicitar_detalles"
}
```

---

## 📋 Workflow 2: Notificaciones de Pedidos

### **Descripción**:
Procesa actualizaciones de estado de pedidos y ejecuta acciones automáticas.

### **Webhook URL**:
```
POST http://localhost:5678/webhook/pedido-actualizado
```

### **Flujo del Workflow**:

```
1. Webhook Pedido Actualizado
   ↓
2. Formatear Notificación
   ├─ Extrae datos del pedido
   ├─ Genera mensaje personalizado
   └─ Agrega emojis según estado
   ↓
3. ¿Estado = Entregado?
   ├─ SÍ → Re-entrenar Modelo ML
   │        ├─ POST /api/orders/ml/retrain
   │        ├─ Modelo aprende del pedido completado
   │        └─ Mejora precisión de predicciones
   │
   └─ NO → Continuar
   ↓
4. Enviar Notificación
   ├─ Registra en consola
   ├─ (Opcional) Enviar email
   ├─ (Opcional) Enviar SMS
   └─ (Opcional) Push notification
   ↓
5. Responder
   └─ Confirma procesamiento
```

### **Nodos del Workflow**:

1. **Webhook Pedido Actualizado**
   - Tipo: `n8n-nodes-base.webhook`
   - Path: `/pedido-actualizado`

2. **Formatear Notificación**
   - Tipo: `n8n-nodes-base.function`
   - Genera mensaje según estado

3. **¿Entregado?**
   - Tipo: `n8n-nodes-base.if`
   - Condición: `newStatus === 'delivered'`

4. **Re-entrenar Modelo ML**
   - Tipo: `n8n-nodes-base.httpRequest`
   - POST a `/api/orders/ml/retrain`
   - Solo si pedido entregado

5. **Enviar Notificación**
   - Tipo: `n8n-nodes-base.function`
   - Lógica para notificaciones

6. **Responder**
   - Tipo: `n8n-nodes-base.respondToWebhook`

### **Ejemplo de Uso**:

**Request**:
```json
POST http://localhost:5678/webhook/pedido-actualizado
{
  "orderNumber": "ORD-2024-101",
  "customerName": "Juan Pérez",
  "productName": "Mueble Estándar",
  "quantity": 2,
  "oldStatus": "in_progress",
  "newStatus": "completed"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Notificación procesada",
  "orderNumber": "ORD-2024-101",
  "status": "completed"
}
```

---

## 🔧 Configuración de n8n

### **1. Acceder a n8n**:
```
URL: http://localhost:5678
```

### **2. Importar Workflows**:

1. Abre n8n en el navegador
2. Click en "Workflows" → "Import from File"
3. Importa los archivos:
   - `n8n/workflows/chatbot-workflow.json`
   - `n8n/workflows/notificaciones-pedidos.json`

### **3. Activar Workflows**:

1. Abre cada workflow
2. Click en el botón "Active" (arriba a la derecha)
3. Verifica que el estado sea "Active"

### **4. Obtener URLs de Webhooks**:

1. Abre el workflow
2. Click en el nodo "Webhook"
3. Copia la "Production URL"
4. Ejemplo: `http://localhost:5678/webhook/chatbot`

---

## 🔌 Integración con el Backend

### **Opción 1: Usar n8n (Recomendado)**

Actualiza el frontend para usar n8n:

```typescript
// src/components/Chatbot.tsx
const response = await fetch('http://localhost:5678/webhook/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: inputMessage, userId: user?.id })
});
```

### **Opción 2: Híbrido (Actual)**

El backend actual procesa directamente, pero puedes agregar llamadas a n8n para funciones específicas.

---

## 📊 Ventajas de usar n8n

### **1. Visual Workflow Builder**
- ✅ Diseño visual de flujos
- ✅ Fácil de entender y modificar
- ✅ No requiere programación para cambios

### **2. Integraciones**
- ✅ 200+ integraciones nativas
- ✅ Conecta con servicios externos
- ✅ APIs, bases de datos, servicios cloud

### **3. Automatización**
- ✅ Triggers automáticos
- ✅ Scheduled workflows
- ✅ Event-driven actions

### **4. Escalabilidad**
- ✅ Manejo de alto volumen
- ✅ Queue management
- ✅ Error handling

---

## 🎯 Casos de Uso

### **1. Chatbot Inteligente**
- Usuario envía mensaje
- n8n detecta intención
- Busca en BD si es necesario
- Genera respuesta personalizada
- Guarda conversación

### **2. Notificaciones Automáticas**
- Pedido cambia de estado
- n8n recibe webhook
- Formatea notificación
- Re-entrena modelo si es entregado
- Envía notificación al cliente

### **3. Reportes Automáticos** (Futuro)
- Trigger diario/semanal
- n8n consulta estadísticas
- Genera reporte
- Envía por email

### **4. Integración con CRM** (Futuro)
- Nuevo pedido creado
- n8n sincroniza con CRM
- Actualiza información de cliente
- Registra interacciones

---

## 📝 Archivos Creados

### **Workflows**:
- ✅ `n8n/workflows/chatbot-workflow.json`
- ✅ `n8n/workflows/notificaciones-pedidos.json`

### **Scripts**:
- ✅ `package.json` - Agregado `npm run n8n` y `npm run dev:all`

### **Documentación**:
- ✅ `N8N_INTEGRACION.md` - Esta documentación

---

## 🚀 Próximos Pasos

### **Fase 1: Actual** ✅
- Workflows básicos creados
- Integración con backend
- Procesamiento de mensajes

### **Fase 2: Mejoras**
- [ ] Integración con OpenAI GPT
- [ ] Envío de emails/SMS
- [ ] Reportes automáticos
- [ ] Integración con CRM

### **Fase 3: Avanzado**
- [ ] Workflows complejos
- [ ] Machine Learning avanzado
- [ ] Análisis predictivo
- [ ] Dashboard de n8n

---

## 🎊 Estado Actual

**Sistema Completamente Integrado** con:
- ✅ n8n instalado y configurado
- ✅ 2 workflows creados
- ✅ Backend integrado
- ✅ Chatbot funcionando
- ✅ Notificaciones automáticas
- ✅ Documentación completa

---

## 📖 Comandos Útiles

```bash
# Iniciar todo
npm run dev:all

# Solo n8n
npm run n8n

# Acceder a n8n
http://localhost:5678

# Ver workflows activos
# Ir a n8n → Workflows

# Importar workflow
# n8n → Import from File → Seleccionar JSON
```

---

**¡n8n completamente integrado y listo para usar!** 🎉

**Accede a n8n**: http://localhost:5678
**Importa los workflows** desde `n8n/workflows/`
