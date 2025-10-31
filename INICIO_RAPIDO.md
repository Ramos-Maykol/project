# 🚀 Guía de Inicio Rápido

## ✅ Sistema Iniciado

El sistema completo está corriendo con:
- ✅ Backend API (puerto 3000)
- ✅ Frontend React (puerto 5173)
- ✅ n8n (puerto 5678)

---

## 📝 Pasos para Configurar n8n

### **Paso 1: Acceder a n8n**

1. Abre tu navegador
2. Ve a: **http://localhost:5678**
3. Si es la primera vez, verás la pantalla de bienvenida

### **Paso 2: Configuración Inicial (Primera Vez)**

Si es tu primera vez usando n8n:

1. **Crear Cuenta**:
   - Email: `admin@manufactura.com`
   - Password: `admin123` (o el que prefieras)
   - Nombre: `Administrador`

2. **Skip** el tour (puedes verlo después)

### **Paso 3: Importar Workflows**

1. En n8n, click en **"Workflows"** (menú izquierdo)

2. Click en **"Add workflow"** → **"Import from File"**

3. **Importar Workflow 1: Chatbot**
   - Click "Browse"
   - Navega a: `e:\tesis 2\bolt new\project\n8n\workflows\`
   - Selecciona: `chatbot-workflow.json`
   - Click "Import"

4. **Importar Workflow 2: Notificaciones**
   - Repite el proceso
   - Selecciona: `notificaciones-pedidos.json`
   - Click "Import"

### **Paso 4: Activar Workflows**

Para cada workflow:

1. Abre el workflow
2. Click en el botón **"Inactive"** (arriba a la derecha)
3. Cambiará a **"Active"** ✅

### **Paso 5: Obtener URLs de Webhooks**

1. Abre el workflow "Chatbot Inteligente"
2. Click en el nodo **"Webhook Chatbot"**
3. En el panel derecho, verás:
   - **Production URL**: `http://localhost:5678/webhook/...`
4. Copia esta URL (la usaremos después)

---

## 🧪 Probar el Sistema

### **Test 1: Probar el Chatbot**

1. Abre el frontend: **http://localhost:5173**

2. Inicia sesión:
   - Email: `admin@manufactura.com`
   - Password: `admin123`

3. Click en el botón flotante **💬** (esquina inferior derecha)

4. Escribe mensajes de prueba:
   ```
   "hola"
   "pueden hacer un lavamanos para niños?"
   "cuanto tarda un mueble?"
   "estado del pedido ORD-2024-101"
   ```

5. Verás respuestas inteligentes y personalizadas

### **Test 2: Gestión de Pedidos**

1. En el menú, click en **"Gestión de Pedidos"**

2. Verás:
   - Panel de estadísticas ML
   - Lista de 110 pedidos
   - Filtros por estado

3. Prueba cambiar el estado de un pedido:
   - Busca un pedido "Pendiente"
   - Click en el botón ▶️ "Iniciar"
   - El estado cambia a "En Producción"

4. Completa el ciclo:
   - Click en ✅ "Completar"
   - Click en 🚚 "Entregar"
   - El modelo ML se re-entrena automáticamente

### **Test 3: Solicitar Producto**

1. Click en **"Solicitar Producto"**

2. Completa el formulario:
   - Cliente: "Tu Nombre"
   - Producto: "Mueble Estándar"
   - Cantidad: 1
   - Dimensiones: 120 x 80 x 45 cm

3. Verás la estimación en tiempo real:
   - Tiempo de producción
   - Fecha de entrega
   - Posición en cola

4. Click en **"Crear Pedido"**

5. ¡Pedido creado exitosamente!

### **Test 4: Ver Workflows en n8n**

1. Ve a n8n: **http://localhost:5678**

2. Click en **"Executions"** (menú izquierdo)

3. Verás el historial de ejecuciones:
   - Cada mensaje del chatbot
   - Cada actualización de pedido
   - Estado: Success ✅ o Error ❌

4. Click en una ejecución para ver detalles:
   - Flujo completo
   - Datos procesados
   - Tiempo de ejecución

---

## 🔍 Verificar que Todo Funciona

### **Checklist**:

- [ ] Frontend carga en http://localhost:5173
- [ ] Puedo iniciar sesión
- [ ] Backend responde (ver Network en DevTools)
- [ ] n8n carga en http://localhost:5678
- [ ] Workflows importados y activos
- [ ] Chatbot responde mensajes
- [ ] Puedo crear pedidos
- [ ] Puedo cambiar estados de pedidos
- [ ] Modelo ML muestra estadísticas

---

## 🐛 Solución de Problemas

### **Problema 1: n8n no inicia**

**Solución**:
```bash
# Detener todo
Stop-Process -Name "node" -Force

# Iniciar solo n8n
npm run n8n
```

### **Problema 2: Frontend no conecta con Backend**

**Verificar**:
1. Backend corriendo en puerto 3000
2. Abrir: http://localhost:3000/api/health
3. Debe retornar: `{"status":"ok"}`

### **Problema 3: Workflows no se activan**

**Solución**:
1. Abrir workflow en n8n
2. Click en cada nodo
3. Verificar que no haya errores rojos
4. Guardar workflow (Ctrl+S)
5. Activar de nuevo

### **Problema 4: Chatbot no responde**

**Verificar**:
1. Abrir DevTools (F12)
2. Ir a "Network"
3. Enviar mensaje
4. Ver si hay error en la petición
5. Verificar que Backend esté corriendo

---

## 📊 URLs del Sistema

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend** | http://localhost:5173 | ✅ Activo |
| **Backend API** | http://localhost:3000 | ✅ Activo |
| **n8n** | http://localhost:5678 | ✅ Activo |
| **PostgreSQL** | localhost:5432 | ✅ Activo |

---

## 🎯 Próximos Pasos

### **1. Explorar n8n**:
- Ver workflows visuales
- Modificar nodos
- Crear nuevos workflows

### **2. Personalizar Chatbot**:
- Editar respuestas en `server/routes/chatbot.ts`
- Agregar nuevas intenciones
- Mejorar detección

### **3. Agregar Integraciones**:
- Conectar con email (Gmail, SendGrid)
- Agregar SMS (Twilio)
- Integrar con CRM

### **4. Mejorar ML**:
- Agregar más datos históricos
- Probar otros algoritmos
- Optimizar hiperparámetros

---

## 💡 Consejos

1. **Guarda los workflows** después de modificarlos
2. **Revisa las ejecuciones** en n8n para debug
3. **Usa el chatbot** para probar respuestas
4. **Monitorea el modelo ML** en Gestión de Pedidos
5. **Documenta cambios** que hagas

---

## 📚 Documentación Completa

- `README.md` - Información general
- `DATABASE_SETUP.md` - Configuración de BD
- `SISTEMA_ML_COMPLETO.md` - Machine Learning
- `CHATBOT_FASE2.md` - Chatbot mejorado
- `N8N_INTEGRACION.md` - Integración n8n
- `FLUJO_COMPLETO.md` - Diagramas de flujo

---

## 🎊 ¡Sistema Listo!

Todo está configurado y funcionando:
- ✅ 100 pedidos históricos
- ✅ Modelo ML entrenado
- ✅ Chatbot inteligente
- ✅ n8n workflows
- ✅ Gestión completa

**¡Disfruta tu sistema de manufactura inteligente!** 🚀

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Consulta la documentación específica
3. Verifica los logs en la consola
4. Revisa las ejecuciones en n8n

**¡Éxito con tu proyecto!** 🎉
