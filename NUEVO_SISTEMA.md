# 🎯 Nuevo Sistema de Predicción de Tiempo de Entrega

## 📋 Resumen del Cambio

El sistema ha sido **completamente rediseñado** de un sistema de predicción de eficiencia de producción a un **sistema de estimación de tiempo de entrega de productos personalizados**.

## 🔄 Cambios Principales

### **Antes**: Sistema de Eficiencia
- Predicción de eficiencia de producción
- Análisis de tendencias históricas
- Métricas de rendimiento

### **Ahora**: Sistema de Pedidos y Entregas
- Solicitud de productos personalizados
- Cálculo de tiempo de entrega
- Gestión de cola de producción
- Control de capacidad

## 🏗️ Nueva Arquitectura

### 1. **Tipos de Productos** (`product_types`)
Catálogo de productos disponibles con:
- Nombre y descripción
- Tiempo base de producción (horas por unidad)
- Factor de complejidad
- Tipo de material

**Productos de Ejemplo**:
- Mueble Estándar (8h base)
- Mueble Personalizado (12h base)
- Puerta Estándar (4h base)
- Puerta Personalizada (6h base)
- Ventana Estándar (3h base)
- Cocina Integral (20h base)
- Y más...

### 2. **Pedidos** (`orders`)
Registro de solicitudes de clientes con:
- Número de orden único (ORD-2024-XXX)
- Información del cliente
- Tipo de producto
- Cantidad
- Dimensiones personalizadas (ancho, alto, profundidad)
- Tiempo estimado de producción
- Fecha estimada de entrega
- Estado (pendiente, en producción, completado, entregado)
- Prioridad (normal, alta, urgente)

### 3. **Cola de Producción** (`production_queue`)
Gestión de trabajos en curso:
- Posición en la cola
- Fechas estimadas de inicio/fin
- Estado actual

### 4. **Capacidad de Producción** (`production_capacity`)
Control de recursos disponibles:
- Horas disponibles por día (16h por defecto)
- Horas utilizadas
- Horas restantes
- Número de turnos
- Trabajadores disponibles

## 🎨 Interfaz de Usuario

### **Página "Solicitar Producto"** (antes Predicciones)

#### Formulario de Solicitud:
1. **Nombre del Cliente** (requerido)
2. **Tipo de Producto** (selección de catálogo)
3. **Cantidad** (número de unidades)
4. **Dimensiones** (opcional):
   - Ancho
   - Alto
   - Profundidad
   - Unidad de medida (cm, m, pulgadas)
5. **Prioridad** (normal, alta, urgente)

#### Panel de Estimación en Tiempo Real:
- ⏱️ **Tiempo de Producción**: Horas totales estimadas
- 📅 **Fecha de Entrega**: Fecha estimada de recogida
- 📦 **Posición en Cola**: Lugar en la fila de producción

#### Pedidos Recientes:
- Lista de últimos 5 pedidos
- Estado visual con colores
- Información resumida

## 🧮 Algoritmo de Cálculo

### Fórmula de Tiempo de Producción:

```
Tiempo Total = Tiempo Base × Cantidad × Factor Complejidad × Factor Tamaño
```

**Donde**:
- **Tiempo Base**: Horas por unidad del tipo de producto
- **Cantidad**: Número de unidades solicitadas
- **Factor Complejidad**: Multiplicador del producto (1.0 = normal, 1.5 = complejo)
- **Factor Tamaño**: Basado en dimensiones personalizadas
  ```
  Factor Tamaño = 1.0 + ((Ancho × Alto × Profundidad) / 10000)
  ```

### Cálculo de Fecha de Entrega:

```
Fecha Entrega = Fecha Actual + ((Horas en Cola + Tiempo Total) / 8 horas/día)
```

**Consideraciones**:
- Se asumen 8 horas de trabajo efectivo por día
- Se considera la carga actual de trabajo
- Los pedidos urgentes tienen prioridad

## 📊 Gestión de Carga de Trabajo

### Cola de Producción:
- Los pedidos se ordenan por:
  1. **Prioridad** (urgente > alta > normal)
  2. **Fecha de orden** (FIFO dentro de misma prioridad)

### Capacidad Diaria:
- **16 horas disponibles** por día (2 turnos de 8 horas)
- Actualización automática al crear/completar pedidos
- Visualización de días con capacidad completa

## 🔌 API Endpoints

### Productos:
- `GET /api/orders/product-types` - Listar tipos de productos

### Estimación:
- `POST /api/orders/estimate-delivery` - Calcular tiempo de entrega
  ```json
  {
    "product_type_id": 1,
    "quantity": 2,
    "width": 120,
    "height": 80,
    "depth": 45
  }
  ```

### Pedidos:
- `POST /api/orders` - Crear nuevo pedido
- `GET /api/orders` - Listar todos los pedidos
- `GET /api/orders/:id` - Obtener pedido específico
- `PATCH /api/orders/:id/status` - Actualizar estado

### Cola y Capacidad:
- `GET /api/orders/queue/current` - Ver cola de producción
- `GET /api/orders/capacity/overview` - Ver capacidad disponible

## 🎯 Flujo de Uso

### Para el Cliente:
1. Acceder a "Solicitar Producto"
2. Ingresar nombre y seleccionar tipo de producto
3. Especificar cantidad y dimensiones (si aplica)
4. Ver estimación en tiempo real
5. Confirmar pedido
6. Recibir número de orden y fecha estimada

### Para el Operador:
1. Ver cola de producción en Dashboard
2. Iniciar producción de pedido
3. Actualizar estado a "En Producción"
4. Marcar como "Completado" al terminar
5. Cambiar a "Entregado" al entregar al cliente

## 📈 Beneficios del Nuevo Sistema

✅ **Transparencia**: Cliente conoce tiempo de espera antes de ordenar
✅ **Planificación**: Gestión eficiente de recursos y capacidad
✅ **Priorización**: Manejo de pedidos urgentes
✅ **Personalización**: Productos con dimensiones específicas
✅ **Trazabilidad**: Seguimiento completo del pedido
✅ **Optimización**: Cálculo automático considerando carga actual

## 🚀 Próximos Pasos Sugeridos

1. **Notificaciones**: Alertas cuando un pedido está listo
2. **Portal de Cliente**: Seguimiento en tiempo real del pedido
3. **Optimización de Cola**: Algoritmo de scheduling más avanzado
4. **Costos**: Cálculo automático de presupuesto
5. **Materiales**: Control de inventario de materias primas
6. **Historial**: Análisis de tiempos reales vs estimados
7. **Machine Learning**: Mejorar precisión con datos históricos

## 📝 Notas Técnicas

- Base de datos migrada con `migration_productos.sql`
- Funciones PostgreSQL para cálculos automáticos
- Triggers para actualizar capacidad en tiempo real
- Frontend completamente rediseñado
- API RESTful con nuevos endpoints
- Tipos TypeScript actualizados

## 🔧 Mantenimiento

### Actualizar Capacidad Diaria:
```sql
UPDATE production_capacity 
SET total_hours_available = 24, shift_count = 3 
WHERE date >= CURRENT_DATE;
```

### Agregar Nuevo Tipo de Producto:
```sql
INSERT INTO product_types (name, description, base_production_time, complexity_factor, material_type)
VALUES ('Nuevo Producto', 'Descripción', 10.0, 1.2, 'Material');
```

### Ver Estado de Cola:
```sql
SELECT o.order_number, o.customer_name, o.status, o.estimated_production_time
FROM orders o
WHERE o.status IN ('pending', 'in_progress')
ORDER BY o.priority DESC, o.order_date ASC;
```

---

**Sistema actualizado y listo para usar** ✨
