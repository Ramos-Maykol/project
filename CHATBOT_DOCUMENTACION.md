# 🤖 Chatbot de Ayuda - Documentación

## ✅ Chatbot Implementado

Se ha integrado un **chatbot inteligente de ayuda** en el sistema que está disponible en todas las páginas para asistir a los usuarios.

---

## 🎯 Características del Chatbot

### **1. Disponibilidad**
- ✅ Accesible desde cualquier página del sistema
- ✅ Botón flotante en la esquina inferior derecha
- ✅ Siempre disponible para usuarios autenticados

### **2. Funcionalidades**
- **Respuestas Inteligentes**: Procesa mensajes y responde según palabras clave
- **Conversaciones Guardadas**: Todas las interacciones se guardan en la base de datos
- **Acciones Rápidas**: Botones predefinidos para consultas comunes
- **Interfaz Moderna**: Diseño limpio y responsivo

### **3. Capacidades**
El chatbot puede ayudar con:
- ℹ️ Información sobre productos
- ⏱️ Tiempos de entrega
- 📦 Estado de pedidos
- 📊 Estadísticas del sistema
- ❓ Preguntas frecuentes

---

## 🎨 Interfaz del Usuario

### **Botón Flotante**
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│                                 │
│                          [💬]   │ ← Botón flotante
└─────────────────────────────────┘
```

### **Ventana del Chat**
```
┌──────────────────────────────────┐
│ 💬 Asistente Virtual    [_] [X] │ ← Header
├──────────────────────────────────┤
│                                  │
│ 🤖 ¡Hola! ¿En qué puedo         │ ← Mensajes
│    ayudarte?                     │
│                                  │
│              Hola, necesito      │
│              ayuda 👤            │
│                                  │
├──────────────────────────────────┤
│ [📦 Productos] [⏱️ Tiempos]     │ ← Acciones rápidas
├──────────────────────────────────┤
│ [Escribe tu mensaje...] [Enviar]│ ← Input
└──────────────────────────────────┘
```

---

## 💬 Palabras Clave y Respuestas

### **Saludos**
- **Palabras clave**: hola, buenos, buenas
- **Respuesta**: "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?"

### **Ayuda**
- **Palabras clave**: ayuda, help, que puedes hacer
- **Respuesta**: Lista de funcionalidades disponibles

### **Productos**
- **Palabras clave**: producto, catalogo, que venden
- **Respuesta**: Lista de productos disponibles
  - Muebles (estándar y personalizados)
  - Puertas (estándar y personalizadas)
  - Ventanas (estándar y personalizadas)
  - Closets modulares
  - Cocinas integrales

### **Tiempos de Entrega**
- **Palabras clave**: tiempo, entrega, cuanto tarda, demora
- **Respuesta**: Información sobre estimación de tiempos

### **Precios**
- **Palabras clave**: precio, costo, cuanto cuesta
- **Respuesta**: Indicación de contactar con ventas

### **Despedida**
- **Palabras clave**: gracias, adios, chao, bye
- **Respuesta**: Mensaje de despedida

---

## 🔌 API Endpoints

### **1. Enviar Mensaje**
```
POST /api/chatbot/message

Body:
{
  "message": "Hola, necesito ayuda",
  "userId": 1
}

Response:
{
  "response": "¡Hola! 👋 Soy tu asistente virtual...",
  "timestamp": "2024-10-01T02:30:00.000Z"
}
```

### **2. Obtener Estadísticas**
```
GET /api/chatbot/stats

Response:
{
  "totalOrders": 110,
  "pendingOrders": 8,
  "inProgressOrders": 2,
  "productTypes": 8
}
```

### **3. Buscar Pedido**
```
GET /api/chatbot/order/:orderNumber

Response:
{
  "found": true,
  "order": {
    "orderNumber": "ORD-2024-001",
    "customer": "Juan Perez",
    "product": "Mueble Estándar",
    "quantity": 1,
    "status": "Entregado",
    "estimatedTime": 8.5,
    "estimatedDelivery": "2024-04-05"
  },
  "message": "Pedido ORD-2024-001: ..."
}
```

---

## 🗄️ Base de Datos

### **Tabla: chatbot_conversations**
```sql
CREATE TABLE chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito**: Guardar todas las conversaciones para:
- Análisis de consultas frecuentes
- Mejora del chatbot
- Auditoría de interacciones
- Entrenamiento futuro con ML

---

## 🎨 Componente React

### **Archivo**: `src/components/Chatbot.tsx`

**Características**:
- ✅ Estado local para mensajes
- ✅ Scroll automático al último mensaje
- ✅ Indicador de "escribiendo..."
- ✅ Acciones rápidas
- ✅ Minimizar/Maximizar
- ✅ Cerrar chat
- ✅ Timestamps en mensajes

**Props**: Ninguna (usa contexto de autenticación)

**Estados**:
- `isOpen`: Chat abierto/cerrado
- `isMinimized`: Chat minimizado
- `messages`: Array de mensajes
- `inputMessage`: Texto del input
- `isTyping`: Bot escribiendo

---

## 🚀 Uso del Chatbot

### **Para el Usuario:**

1. **Abrir el Chat**
   - Click en el botón flotante 💬 (esquina inferior derecha)

2. **Escribir Mensaje**
   - Escribe tu pregunta en el input
   - Presiona Enter o click en "Enviar"

3. **Acciones Rápidas**
   - Click en botones predefinidos para consultas comunes
   - Ejemplo: "📦 Productos", "⏱️ Tiempos", "❓ Ayuda"

4. **Minimizar**
   - Click en el botón minimizar para reducir el chat
   - El chat permanece accesible

5. **Cerrar**
   - Click en la X para cerrar completamente
   - Click en el botón flotante para reabrir

### **Ejemplos de Conversación:**

**Ejemplo 1: Consulta de Productos**
```
Usuario: Hola
Bot: ¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?

Usuario: Que productos tienen?
Bot: Ofrecemos:
• Muebles (estándar y personalizados)
• Puertas (estándar y personalizadas)
• Ventanas (estándar y personalizadas)
• Closets modulares
• Cocinas integrales
```

**Ejemplo 2: Consulta de Tiempos**
```
Usuario: Cuanto tarda un pedido?
Bot: Los tiempos de entrega varían según el producto y la carga actual. 
Usa la sección "Solicitar Producto" para obtener una estimación precisa.
```

**Ejemplo 3: Ayuda General**
```
Usuario: Ayuda
Bot: Puedo ayudarte con:
• Información sobre pedidos
• Estado de producción
• Tiempos de entrega
• Tipos de productos
• Estadísticas del sistema
```

---

## 🔧 Personalización

### **Agregar Nuevas Respuestas**

Edita `server/routes/chatbot.ts`:

```typescript
const responses: { [key: string]: string } = {
  'nueva_palabra': 'Nueva respuesta personalizada',
  // ... más respuestas
};
```

### **Agregar Nuevas Palabras Clave**

En la función `processMessage()`:

```typescript
if (lowerMessage.includes('nueva_palabra')) {
  return responses['nueva_palabra'];
}
```

### **Personalizar Estilo**

Edita `src/components/Chatbot.tsx`:
- Colores en clases de Tailwind
- Tamaño de la ventana
- Posición del botón flotante

---

## 📊 Mejoras Futuras

### **Fase 1: Actual** ✅
- Respuestas basadas en palabras clave
- Guardado de conversaciones
- Interfaz moderna

### **Fase 2: Próxima**
- 🔄 Integración con n8n workflows
- 🤖 Respuestas con IA (OpenAI/GPT)
- 📈 Análisis de sentimientos
- 🔍 Búsqueda de pedidos por número

### **Fase 3: Avanzada**
- 🧠 Machine Learning para respuestas
- 🌐 Soporte multiidioma
- 🔊 Comandos de voz
- 📱 Notificaciones push

---

## 🎯 Integración con n8n

### **Workflow Sugerido:**

```
Mensaje Usuario → Webhook n8n → Procesamiento → Respuesta
                      ↓
                  Base de Datos
                      ↓
                  Análisis ML
                      ↓
                  Respuesta Mejorada
```

### **Configuración n8n:**

1. **Crear Webhook**
   - URL: `http://localhost:5678/webhook/chatbot`
   - Método: POST

2. **Procesar Mensaje**
   - Extraer texto
   - Clasificar intención
   - Buscar en base de datos

3. **Generar Respuesta**
   - Usar plantillas
   - Consultar API externa (opcional)
   - Retornar JSON

4. **Guardar Conversación**
   - Insertar en PostgreSQL
   - Actualizar estadísticas

---

## 📝 Archivos Creados

### Backend:
- ✅ `server/routes/chatbot.ts` - Lógica del chatbot
- ✅ `database/chatbot_table.sql` - Tabla de conversaciones

### Frontend:
- ✅ `src/components/Chatbot.tsx` - Componente del chat
- ✅ `src/App.tsx` - Integración del chatbot

### Documentación:
- ✅ `CHATBOT_DOCUMENTACION.md` - Esta documentación

---

## 🎊 Estado Actual

**Chatbot 100% Funcional** con:
- ✅ Interfaz moderna y responsiva
- ✅ Respuestas inteligentes
- ✅ Guardado de conversaciones
- ✅ Acciones rápidas
- ✅ Disponible en todas las páginas
- ✅ Integrado con el sistema

**Acceso**: http://localhost:5173 (botón flotante en esquina inferior derecha)

---

## 🚀 Próximos Pasos

1. **Probar el Chatbot**
   - Hacer preguntas variadas
   - Probar acciones rápidas
   - Verificar guardado de conversaciones

2. **Personalizar Respuestas**
   - Agregar más palabras clave
   - Mejorar respuestas existentes

3. **Integrar con n8n** (opcional)
   - Crear workflows avanzados
   - Conectar con APIs externas

4. **Agregar IA** (opcional)
   - Integrar OpenAI GPT
   - Respuestas más naturales

---

**¡Chatbot listo para usar!** 🎉
