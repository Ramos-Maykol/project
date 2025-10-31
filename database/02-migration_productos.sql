-- Migración para sistema de predicción de tiempo de entrega
-- Ejecutar después de init.sql

-- Tabla de tipos de productos
CREATE TABLE IF NOT EXISTS product_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_production_time NUMERIC(10, 2) NOT NULL, -- Tiempo base en horas por unidad
    complexity_factor NUMERIC(5, 2) DEFAULT 1.0, -- Factor de complejidad (1.0 = normal)
    material_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pedidos/órdenes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_type_id INTEGER REFERENCES product_types(id),
    customer_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    -- Dimensiones del producto
    width NUMERIC(10, 2),
    height NUMERIC(10, 2),
    depth NUMERIC(10, 2),
    dimension_unit VARCHAR(20) DEFAULT 'cm',
    -- Cálculos de tiempo
    estimated_production_time NUMERIC(10, 2), -- Horas totales estimadas
    estimated_delivery_date TIMESTAMP,
    -- Estado del pedido
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, delivered
    priority INTEGER DEFAULT 1, -- 1=normal, 2=alta, 3=urgente
    -- Fechas
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_production_date TIMESTAMP,
    completion_date TIMESTAMP,
    delivery_date TIMESTAMP,
    -- Auditoría
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cola de producción (para tracking en tiempo real)
CREATE TABLE IF NOT EXISTS production_queue (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    position INTEGER NOT NULL, -- Posición en la cola
    estimated_start TIMESTAMP,
    estimated_end TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    status VARCHAR(50) DEFAULT 'queued', -- queued, in_progress, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de capacidad de producción
CREATE TABLE IF NOT EXISTS production_capacity (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_hours_available NUMERIC(10, 2) DEFAULT 16.0, -- Horas disponibles por día
    hours_used NUMERIC(10, 2) DEFAULT 0,
    hours_remaining NUMERIC(10, 2) DEFAULT 16.0,
    shift_count INTEGER DEFAULT 2, -- Número de turnos
    workers_available INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(estimated_delivery_date);
CREATE INDEX IF NOT EXISTS idx_production_queue_status ON production_queue(status);
CREATE INDEX IF NOT EXISTS idx_production_queue_position ON production_queue(position);
CREATE INDEX IF NOT EXISTS idx_production_capacity_date ON production_capacity(date);

-- Insertar tipos de productos de ejemplo
INSERT INTO product_types (name, description, base_production_time, complexity_factor, material_type) VALUES
    ('Mueble Estándar', 'Mueble de tamaño estándar con diseño básico', 8.0, 1.0, 'Madera'),
    ('Mueble Personalizado', 'Mueble con diseño personalizado', 12.0, 1.5, 'Madera'),
    ('Puerta Estándar', 'Puerta de tamaño estándar', 4.0, 0.8, 'Madera/Metal'),
    ('Puerta Personalizada', 'Puerta con diseño y medidas personalizadas', 6.0, 1.2, 'Madera/Metal'),
    ('Ventana Estándar', 'Ventana de tamaño estándar', 3.0, 0.7, 'Aluminio/Vidrio'),
    ('Ventana Personalizada', 'Ventana con medidas personalizadas', 5.0, 1.0, 'Aluminio/Vidrio'),
    ('Closet Modular', 'Closet con módulos estándar', 10.0, 1.3, 'Madera'),
    ('Cocina Integral', 'Cocina completa con muebles', 20.0, 1.8, 'Madera/Granito');

-- Insertar capacidad de producción para los próximos 30 días
INSERT INTO production_capacity (date, total_hours_available, hours_used, hours_remaining)
SELECT 
    CURRENT_DATE + (n || ' days')::interval,
    16.0,
    0,
    16.0
FROM generate_series(0, 29) n
ON CONFLICT (date) DO NOTHING;

-- Función para actualizar capacidad de producción
CREATE OR REPLACE FUNCTION update_production_capacity()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar horas usadas y restantes cuando cambia un pedido
    UPDATE production_capacity pc
    SET 
        hours_used = COALESCE((
            SELECT SUM(o.estimated_production_time)
            FROM orders o
            WHERE DATE(o.estimated_delivery_date) = pc.date
            AND o.status IN ('pending', 'in_progress')
        ), 0),
        hours_remaining = total_hours_available - COALESCE((
            SELECT SUM(o.estimated_production_time)
            FROM orders o
            WHERE DATE(o.estimated_delivery_date) = pc.date
            AND o.status IN ('pending', 'in_progress')
        ), 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE DATE(NEW.estimated_delivery_date) = pc.date;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar capacidad automáticamente
CREATE TRIGGER trigger_update_capacity
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_production_capacity();

-- Función para calcular tiempo de entrega estimado
CREATE OR REPLACE FUNCTION calculate_delivery_time(
    p_product_type_id INTEGER,
    p_quantity INTEGER,
    p_width NUMERIC DEFAULT NULL,
    p_height NUMERIC DEFAULT NULL,
    p_depth NUMERIC DEFAULT NULL
) RETURNS TABLE (
    estimated_hours NUMERIC,
    estimated_delivery_date TIMESTAMP,
    queue_position INTEGER
) AS $$
DECLARE
    v_base_time NUMERIC;
    v_complexity NUMERIC;
    v_total_hours NUMERIC;
    v_size_factor NUMERIC := 1.0;
    v_current_queue_hours NUMERIC;
    v_delivery_date TIMESTAMP;
    v_position INTEGER;
BEGIN
    -- Obtener tiempo base y complejidad del producto
    SELECT base_production_time, complexity_factor
    INTO v_base_time, v_complexity
    FROM product_types
    WHERE id = p_product_type_id;
    
    -- Calcular factor de tamaño si se proporcionan dimensiones
    IF p_width IS NOT NULL AND p_height IS NOT NULL THEN
        v_size_factor := 1.0 + ((p_width * p_height * COALESCE(p_depth, 1)) / 10000.0);
    END IF;
    
    -- Calcular tiempo total
    v_total_hours := v_base_time * p_quantity * v_complexity * v_size_factor;
    
    -- Calcular fecha de entrega (solo tiempo del pedido actual)
    v_delivery_date := CURRENT_TIMESTAMP + ((v_total_hours / 8.0) || ' days')::interval;
    
    -- Obtener posición en cola
    SELECT COUNT(*) + 1
    INTO v_position
    FROM orders
    WHERE status IN ('pending', 'in_progress');
    
    RETURN QUERY SELECT v_total_hours, v_delivery_date, v_position;
END;
$$ LANGUAGE plpgsql;

-- Insertar algunos pedidos de ejemplo
INSERT INTO orders (order_number, product_type_id, customer_name, quantity, width, height, depth, estimated_production_time, estimated_delivery_date, status, created_by)
VALUES 
    ('ORD-2024-001', 1, 'Juan Pérez', 2, 120, 80, 45, 16.5, CURRENT_TIMESTAMP + interval '2 days', 'in_progress', 1),
    ('ORD-2024-002', 3, 'María García', 1, 90, 210, 5, 4.2, CURRENT_TIMESTAMP + interval '3 days', 'pending', 1),
    ('ORD-2024-003', 2, 'Carlos López', 1, 150, 100, 60, 18.0, CURRENT_TIMESTAMP + interval '4 days', 'pending', 1);
