import { Router } from 'express';
import { pool } from '../database/config';

const router = Router();

// Intenciones del chatbot
interface Intent {
  keywords: string[];
  response: (context?: any) => string;
  action?: string;
}

const intents: { [key: string]: Intent } = {
  saludo: {
    keywords: ['hola', 'buenos', 'buenas', 'hey', 'hi', 'saludos'],
    response: () => '¡Hola! 👋 Soy tu asistente virtual de manufactura. Puedo ayudarte con:\n\n• Cotizaciones de productos personalizados\n• Consultar estado de pedidos\n• Información sobre tiempos de entrega\n• Catálogo de productos\n\n¿Qué necesitas hoy?'
  },
  
  producto_personalizado: {
    keywords: ['elaborar', 'hacer', 'fabricar', 'construir', 'pueden hacer', 'hacen', 'fabrican'],
    response: (context) => {
      const msg = context?.message || '';
      let productType = 'producto personalizado';
      let suggestions = '';
      
      // Detectar tipo de producto
      if (msg.includes('mueble') || msg.includes('mesa') || msg.includes('silla') || msg.includes('escritorio')) {
        productType = 'mueble';
        suggestions = '\n\n💡 Sugerencias:\n• Muebles estándar (8h de producción)\n• Muebles personalizados (12h de producción)';
      } else if (msg.includes('puerta')) {
        productType = 'puerta';
        suggestions = '\n\n💡 Sugerencias:\n• Puertas estándar (4h de producción)\n• Puertas personalizadas (6h de producción)';
      } else if (msg.includes('ventana')) {
        productType = 'ventana';
        suggestions = '\n\n💡 Sugerencias:\n• Ventanas estándar (3h de producción)\n• Ventanas personalizadas (5h de producción)';
      } else if (msg.includes('closet') || msg.includes('armario')) {
        productType = 'closet';
        suggestions = '\n\n💡 Sugerencias:\n• Closets modulares (10h de producción)';
      } else if (msg.includes('cocina')) {
        productType = 'cocina';
        suggestions = '\n\n💡 Sugerencias:\n• Cocinas integrales (20h de producción)';
      } else if (msg.includes('lavamanos') || msg.includes('lavabo') || msg.includes('lavatorio')) {
        productType = 'mueble de baño personalizado';
        suggestions = '\n\n💡 Sugerencias:\n• Muebles de baño personalizados\n• Lavamanos con medidas especiales\n• Diseños adaptados para niños';
      }
      
      return `¡Por supuesto! 😊 Sí podemos elaborar ${productType}.\n\nPara darte una cotización precisa, necesito algunos detalles:\n\n📏 **Dimensiones**:\n• Ancho\n• Alto\n• Profundidad\n\n📦 **Cantidad**: ¿Cuántas unidades necesitas?\n\n🎨 **Material preferido**: Madera, metal, otro?\n\n⏱️ **Urgencia**: ¿Tienes fecha límite?${suggestions}\n\n¿Puedes darme estos detalles para calcular el tiempo y costo?`;
    }
  },
  
  consulta_pedido: {
    keywords: ['pedido', 'orden', 'ORD-', 'estado', 'seguimiento', 'tracking'],
    response: () => '📦 Para consultar tu pedido, necesito el **número de orden**.\n\nFormato: ORD-2024-XXX\n\nEjemplo: "¿Cuál es el estado del pedido ORD-2024-101?"\n\n¿Tienes el número de orden?'
  },
  
  tiempo_entrega: {
    keywords: ['cuanto tarda', 'tiempo', 'demora', 'entrega', 'cuando', 'plazo'],
    response: () => '⏱️ Los tiempos de entrega dependen de:\n\n1. **Tipo de producto**\n2. **Complejidad del diseño**\n3. **Cantidad solicitada**\n4. **Carga actual de producción**\n\n📊 **Tiempos promedio**:\n• Productos estándar: 2-5 días\n• Productos personalizados: 5-10 días\n• Proyectos grandes: 10-20 días\n\n💡 Para una estimación exacta, ve a **"Solicitar Producto"** y el sistema calculará automáticamente el tiempo usando nuestro modelo de IA.\n\n¿Qué tipo de producto necesitas?'
  },
  
  precio_cotizacion: {
    keywords: ['precio', 'costo', 'cuanto cuesta', 'cotizacion', 'presupuesto', 'valor'],
    response: () => '💰 Para darte un precio exacto, necesito:\n\n📏 **Especificaciones**:\n• Tipo de producto\n• Dimensiones\n• Material\n• Cantidad\n\n🎨 **Personalización**:\n• Diseño estándar o personalizado\n• Acabados especiales\n• Accesorios adicionales\n\n📝 **Opciones**:\n1. Usa **"Solicitar Producto"** para cotización automática\n2. Descríbeme lo que necesitas aquí\n3. Contacta a ventas: ventas@manufactura.com\n\n¿Qué prefieres?'
  },
  
  catalogo_productos: {
    keywords: ['productos', 'catalogo', 'que hacen', 'que fabrican', 'que venden', 'opciones'],
    response: () => '📋 **Nuestro Catálogo de Productos**:\n\n🪑 **Muebles**\n• Estándar (mesas, sillas, escritorios)\n• Personalizados (diseños únicos)\n\n🚪 **Puertas**\n• Estándar (medidas comunes)\n• Personalizadas (cualquier tamaño)\n\n🪟 **Ventanas**\n• Estándar (aluminio/vidrio)\n• Personalizadas (medidas especiales)\n\n🗄️ **Closets**\n• Modulares (adaptables)\n\n🍳 **Cocinas Integrales**\n• Diseños completos\n\n✨ **Productos Especiales**\n• Muebles de baño\n• Muebles infantiles\n• Diseños a medida\n\n¿Qué te interesa?'
  },
  
  ayuda: {
    keywords: ['ayuda', 'help', 'que puedes hacer', 'opciones', 'menu'],
    response: () => '🤖 **Puedo ayudarte con**:\n\n1️⃣ **Cotizaciones**\n   • Productos personalizados\n   • Estimación de tiempos\n   • Cálculo de costos\n\n2️⃣ **Seguimiento**\n   • Estado de pedidos\n   • Tiempos de entrega\n   • Ubicación en cola\n\n3️⃣ **Información**\n   • Catálogo de productos\n   • Capacidades de fabricación\n   • Materiales disponibles\n\n4️⃣ **Soporte**\n   • Preguntas frecuentes\n   • Contacto con equipo\n   • Guías del sistema\n\n💬 Solo escribe tu pregunta naturalmente, ¡entiendo lenguaje normal!'
  },
  
  agradecimiento: {
    keywords: ['gracias', 'thank', 'excelente', 'perfecto', 'genial'],
    response: () => '¡De nada! 😊 Me alegra poder ayudarte.\n\n¿Hay algo más en lo que pueda asistirte?\n\n💡 Recuerda que puedo:\n• Hacer cotizaciones\n• Consultar pedidos\n• Responder dudas'
  },
  
  despedida: {
    keywords: ['adios', 'chao', 'bye', 'hasta luego', 'nos vemos'],
    response: () => '¡Hasta pronto! 👋\n\nQue tengas un excelente día.\n\nSi necesitas algo más, aquí estaré. 😊'
  }
};

// Función mejorada para detectar intención
function detectIntent(message: string): string | null {
  const lowerMessage = message.toLowerCase().trim();
  
  for (const [intentName, intent] of Object.entries(intents)) {
    for (const keyword of intent.keywords) {
      if (lowerMessage.includes(keyword)) {
        return intentName;
      }
    }
  }
  
  return null;
}

// Función para extraer número de orden
function extractOrderNumber(message: string): string | null {
  const match = message.match(/ORD-\d{4}-\d{3}/i);
  return match ? match[0].toUpperCase() : null;
}

// Función mejorada para procesar el mensaje
async function processMessage(message: string, userId?: number): Promise<string> {
  const lowerMessage = message.toLowerCase().trim();
  
  // Detectar número de orden
  const orderNumber = extractOrderNumber(message);
  if (orderNumber) {
    try {
      const result = await pool.query(
        `SELECT o.*, pt.name as product_name 
         FROM orders o 
         LEFT JOIN product_types pt ON o.product_type_id = pt.id 
         WHERE o.order_number = $1`,
        [orderNumber]
      );
      
      if (result.rows.length > 0) {
        const order = result.rows[0];
        const statusEmoji = {
          'pending': '⏳',
          'in_progress': '🔨',
          'completed': '✅',
          'delivered': '📦'
        }[order.status] || '📋';
        
        const statusText = {
          'pending': 'Pendiente',
          'in_progress': 'En Producción',
          'completed': 'Completado',
          'delivered': 'Entregado'
        }[order.status] || order.status;
        
        return `${statusEmoji} **Pedido ${orderNumber}**\n\n👤 Cliente: ${order.customer_name}\n📦 Producto: ${order.product_name}\n📊 Cantidad: ${order.quantity}\n⏱️ Tiempo estimado: ${order.estimated_production_time}h\n📅 Entrega estimada: ${new Date(order.estimated_delivery_date).toLocaleDateString('es-ES')}\n🔖 Estado: **${statusText}**\n\n¿Necesitas más información?`;
      }
    } catch (error) {
      console.error('Error buscando pedido:', error);
    }
  }
  
  // Detectar intención
  const intent = detectIntent(message);
  
  if (intent && intents[intent]) {
    return intents[intent].response({ message: lowerMessage, userId });
  }
  
  // Respuesta inteligente por defecto
  if (lowerMessage.includes('?')) {
    return '🤔 Entiendo tu pregunta.\n\nPuedo ayudarte mejor si me dices:\n\n• ¿Necesitas cotizar un producto?\n• ¿Quieres consultar un pedido?\n• ¿Buscas información del catálogo?\n\nO simplemente escribe "ayuda" para ver todas mis funciones. 😊';
  }
  
  return '💬 Gracias por tu mensaje.\n\nPara ayudarte mejor, puedes:\n\n1️⃣ Describir qué producto necesitas\n2️⃣ Consultar un pedido con su número\n3️⃣ Escribir "ayuda" para ver opciones\n\n¿Qué necesitas?';
}

// Endpoint principal del chatbot
router.post('/message', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }
    
    // Procesar mensaje (ahora es async)
    const response = await processMessage(message, userId);
    
    // Guardar conversación en la base de datos
    try {
      await pool.query(
        'INSERT INTO chatbot_conversations (user_id, user_message, bot_response, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [userId || null, message, response]
      );
    } catch (dbError) {
      console.log('Error guardando conversación:', dbError);
    }
    
    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en chatbot:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener estadísticas para el chatbot
router.get('/stats', async (req, res) => {
  try {
    // Obtener estadísticas del sistema
    const ordersCount = await pool.query('SELECT COUNT(*) as total FROM orders');
    const pendingOrders = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = $1', ['pending']);
    const inProgressOrders = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = $1', ['in_progress']);
    const productTypes = await pool.query('SELECT COUNT(*) as total FROM product_types');
    
    res.json({
      totalOrders: parseInt(ordersCount.rows[0].total),
      pendingOrders: parseInt(pendingOrders.rows[0].total),
      inProgressOrders: parseInt(inProgressOrders.rows[0].total),
      productTypes: parseInt(productTypes.rows[0].total)
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener información de pedido específico
router.get('/order/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const result = await pool.query(
      `SELECT o.*, pt.name as product_name 
       FROM orders o 
       LEFT JOIN product_types pt ON o.product_type_id = pt.id 
       WHERE o.order_number = $1`,
      [orderNumber]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        found: false,
        message: `No encontré el pedido ${orderNumber}. Verifica el número de orden.`
      });
    }
    
    const order = result.rows[0];
    const statusText = {
      'pending': 'Pendiente',
      'in_progress': 'En Producción',
      'completed': 'Completado',
      'delivered': 'Entregado'
    }[order.status] || order.status;
    
    res.json({
      found: true,
      order: {
        orderNumber: order.order_number,
        customer: order.customer_name,
        product: order.product_name,
        quantity: order.quantity,
        status: statusText,
        estimatedTime: order.estimated_production_time,
        estimatedDelivery: order.estimated_delivery_date
      },
      message: `Pedido ${orderNumber}:\n• Cliente: ${order.customer_name}\n• Producto: ${order.product_name}\n• Estado: ${statusText}\n• Tiempo estimado: ${order.estimated_production_time}h`
    });
  } catch (error) {
    console.error('Error buscando pedido:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
