-- Script para generar datos simulados de pedidos
-- Incluye pedidos entregados y en espera para entrenar el modelo

-- Limpiar pedidos de ejemplo anteriores
DELETE FROM orders WHERE id <= 3;

-- Generar 50 pedidos históricos ENTREGADOS (últimos 3 meses)
-- Estos servirán para entrenar el modelo

INSERT INTO orders (
    order_number, product_type_id, customer_name, quantity, 
    width, height, depth, dimension_unit,
    estimated_production_time, estimated_delivery_date,
    status, priority, 
    order_date, start_production_date, completion_date, delivery_date,
    created_by
) VALUES
-- Muebles Estándar
('ORD-2024-001', 1, 'Carlos Mendoza', 1, 120, 80, 45, 'cm', 8.5, '2024-07-15 10:00:00', 'delivered', 1, '2024-07-10 09:00:00', '2024-07-12 08:00:00', '2024-07-15 17:00:00', '2024-07-15 18:30:00', 1),
('ORD-2024-002', 1, 'Ana Torres', 2, 100, 75, 40, 'cm', 16.2, '2024-07-18 14:00:00', 'delivered', 1, '2024-07-11 10:30:00', '2024-07-15 08:00:00', '2024-07-18 16:00:00', '2024-07-18 19:00:00', 1),
('ORD-2024-003', 1, 'Roberto Silva', 1, 150, 90, 50, 'cm', 9.8, '2024-07-22 11:00:00', 'delivered', 2, '2024-07-18 14:00:00', '2024-07-19 08:00:00', '2024-07-22 12:00:00', '2024-07-22 15:00:00', 1),

-- Muebles Personalizados
('ORD-2024-004', 2, 'María González', 1, 180, 100, 60, 'cm', 18.5, '2024-07-25 16:00:00', 'delivered', 1, '2024-07-19 11:00:00', '2024-07-22 08:00:00', '2024-07-25 17:00:00', '2024-07-26 10:00:00', 1),
('ORD-2024-005', 2, 'Luis Ramírez', 1, 200, 120, 70, 'cm', 22.3, '2024-07-30 10:00:00', 'delivered', 2, '2024-07-23 09:00:00', '2024-07-26 08:00:00', '2024-07-30 11:00:00', '2024-07-30 14:00:00', 1),
('ORD-2024-006', 2, 'Patricia Díaz', 2, 160, 95, 55, 'cm', 35.8, '2024-08-05 15:00:00', 'delivered', 1, '2024-07-28 10:00:00', '2024-07-31 08:00:00', '2024-08-05 16:00:00', '2024-08-06 09:00:00', 1),

-- Puertas Estándar
('ORD-2024-007', 3, 'Jorge Castro', 3, 90, 210, 5, 'cm', 12.5, '2024-08-08 12:00:00', 'delivered', 1, '2024-08-02 11:00:00', '2024-08-06 08:00:00', '2024-08-08 13:00:00', '2024-08-08 16:00:00', 1),
('ORD-2024-008', 3, 'Elena Vargas', 2, 85, 200, 4, 'cm', 8.2, '2024-08-12 10:00:00', 'delivered', 1, '2024-08-07 09:00:00', '2024-08-09 08:00:00', '2024-08-12 11:00:00', '2024-08-12 14:00:00', 1),
('ORD-2024-009', 3, 'Fernando Ruiz', 1, 90, 210, 5, 'cm', 4.1, '2024-08-14 09:00:00', 'delivered', 3, '2024-08-12 15:00:00', '2024-08-13 08:00:00', '2024-08-14 10:00:00', '2024-08-14 11:00:00', 1),

-- Puertas Personalizadas
('ORD-2024-010', 4, 'Sandra López', 1, 100, 220, 6, 'cm', 7.2, '2024-08-17 14:00:00', 'delivered', 1, '2024-08-13 10:00:00', '2024-08-15 08:00:00', '2024-08-17 15:00:00', '2024-08-17 17:00:00', 1),
('ORD-2024-011', 4, 'Miguel Ángel', 2, 95, 215, 5, 'cm', 14.1, '2024-08-21 11:00:00', 'delivered', 2, '2024-08-16 11:00:00', '2024-08-18 08:00:00', '2024-08-21 12:00:00', '2024-08-21 15:00:00', 1),
('ORD-2024-012', 4, 'Carmen Flores', 1, 110, 230, 7, 'cm', 7.8, '2024-08-24 10:00:00', 'delivered', 1, '2024-08-19 09:00:00', '2024-08-22 08:00:00', '2024-08-24 11:00:00', '2024-08-24 13:00:00', 1),

-- Ventanas Estándar
('ORD-2024-013', 5, 'Ricardo Morales', 4, 120, 150, 10, 'cm', 12.8, '2024-08-27 15:00:00', 'delivered', 1, '2024-08-22 10:00:00', '2024-08-24 08:00:00', '2024-08-27 16:00:00', '2024-08-27 18:00:00', 1),
('ORD-2024-014', 5, 'Lucía Herrera', 2, 100, 140, 8, 'cm', 6.2, '2024-08-30 12:00:00', 'delivered', 1, '2024-08-26 11:00:00', '2024-08-28 08:00:00', '2024-08-30 13:00:00', '2024-08-30 15:00:00', 1),
('ORD-2024-015', 5, 'Andrés Peña', 3, 110, 145, 9, 'cm', 9.5, '2024-09-03 10:00:00', 'delivered', 2, '2024-08-29 14:00:00', '2024-08-31 08:00:00', '2024-09-03 11:00:00', '2024-09-03 13:00:00', 1),

-- Ventanas Personalizadas
('ORD-2024-016', 6, 'Gloria Sánchez', 2, 150, 180, 12, 'cm', 11.5, '2024-09-06 14:00:00', 'delivered', 1, '2024-09-01 10:00:00', '2024-09-04 08:00:00', '2024-09-06 15:00:00', '2024-09-06 17:00:00', 1),
('ORD-2024-017', 6, 'Héctor Rojas', 1, 130, 160, 10, 'cm', 5.8, '2024-09-09 11:00:00', 'delivered', 1, '2024-09-05 09:00:00', '2024-09-07 08:00:00', '2024-09-09 12:00:00', '2024-09-09 14:00:00', 1),
('ORD-2024-018', 6, 'Isabel Ortiz', 3, 140, 170, 11, 'cm', 17.2, '2024-09-13 16:00:00', 'delivered', 2, '2024-09-08 11:00:00', '2024-09-10 08:00:00', '2024-09-13 17:00:00', '2024-09-14 09:00:00', 1),

-- Closets Modulares
('ORD-2024-019', 7, 'Pablo Navarro', 1, 250, 240, 60, 'cm', 15.8, '2024-09-17 10:00:00', 'delivered', 1, '2024-09-11 10:00:00', '2024-09-14 08:00:00', '2024-09-17 11:00:00', '2024-09-17 14:00:00', 1),
('ORD-2024-020', 7, 'Raquel Jiménez', 1, 300, 250, 70, 'cm', 18.5, '2024-09-21 15:00:00', 'delivered', 2, '2024-09-15 11:00:00', '2024-09-18 08:00:00', '2024-09-21 16:00:00', '2024-09-22 10:00:00', 1),

-- Cocinas Integrales
('ORD-2024-021', 8, 'Sergio Medina', 1, 400, 250, 60, 'cm', 32.5, '2024-09-26 12:00:00', 'delivered', 1, '2024-09-18 09:00:00', '2024-09-22 08:00:00', '2024-09-26 13:00:00', '2024-09-26 16:00:00', 1),
('ORD-2024-022', 8, 'Teresa Campos', 1, 450, 260, 65, 'cm', 38.2, '2024-10-02 10:00:00', 'delivered', 2, '2024-09-23 10:00:00', '2024-09-27 08:00:00', '2024-10-02 11:00:00', '2024-10-02 14:00:00', 1),

-- Más pedidos variados para mejor entrenamiento
('ORD-2024-023', 1, 'Víctor Reyes', 3, 110, 85, 42, 'cm', 24.8, '2024-09-10 14:00:00', 'delivered', 1, '2024-09-03 10:00:00', '2024-09-06 08:00:00', '2024-09-10 15:00:00', '2024-09-10 17:00:00', 1),
('ORD-2024-024', 2, 'Daniela Cruz', 1, 170, 105, 58, 'cm', 19.2, '2024-09-14 11:00:00', 'delivered', 1, '2024-09-07 11:00:00', '2024-09-10 08:00:00', '2024-09-14 12:00:00', '2024-09-14 15:00:00', 1),
('ORD-2024-025', 3, 'Oscar Vega', 4, 88, 205, 4, 'cm', 16.5, '2024-09-18 13:00:00', 'delivered', 2, '2024-09-12 09:00:00', '2024-09-15 08:00:00', '2024-09-18 14:00:00', '2024-09-18 16:00:00', 1),
('ORD-2024-026', 4, 'Mónica Paredes', 2, 92, 212, 5, 'cm', 14.5, '2024-09-22 10:00:00', 'delivered', 1, '2024-09-16 10:00:00', '2024-09-19 08:00:00', '2024-09-22 11:00:00', '2024-09-22 13:00:00', 1),
('ORD-2024-027', 5, 'Gustavo Lara', 5, 115, 148, 9, 'cm', 16.2, '2024-09-25 15:00:00', 'delivered', 1, '2024-09-19 11:00:00', '2024-09-22 08:00:00', '2024-09-25 16:00:00', '2024-09-25 18:00:00', 1),
('ORD-2024-028', 6, 'Natalia Ríos', 2, 145, 175, 11, 'cm', 11.8, '2024-09-28 12:00:00', 'delivered', 2, '2024-09-23 10:00:00', '2024-09-25 08:00:00', '2024-09-28 13:00:00', '2024-09-28 15:00:00', 1),
('ORD-2024-029', 7, 'Emilio Guzmán', 1, 280, 245, 65, 'cm', 17.5, '2024-09-30 14:00:00', 'delivered', 1, '2024-09-24 09:00:00', '2024-09-27 08:00:00', '2024-09-30 15:00:00', '2024-09-30 17:00:00', 1),
('ORD-2024-030', 1, 'Claudia Mora', 2, 125, 82, 46, 'cm', 16.8, '2024-10-03 11:00:00', 'delivered', 1, '2024-09-27 10:00:00', '2024-09-30 08:00:00', '2024-10-03 12:00:00', '2024-10-03 14:00:00', 1),

-- Pedidos adicionales con variaciones
('ORD-2024-031', 2, 'Alfredo Soto', 1, 190, 115, 68, 'cm', 21.5, '2024-10-07 10:00:00', 'delivered', 2, '2024-09-30 11:00:00', '2024-10-03 08:00:00', '2024-10-07 11:00:00', '2024-10-07 13:00:00', 1),
('ORD-2024-032', 3, 'Beatriz Luna', 2, 91, 208, 5, 'cm', 8.4, '2024-10-10 14:00:00', 'delivered', 1, '2024-10-05 10:00:00', '2024-10-08 08:00:00', '2024-10-10 15:00:00', '2024-10-10 17:00:00', 1),
('ORD-2024-033', 4, 'Rodrigo Paz', 1, 105, 225, 6, 'cm', 7.5, '2024-10-13 12:00:00', 'delivered', 1, '2024-10-08 09:00:00', '2024-10-11 08:00:00', '2024-10-13 13:00:00', '2024-10-13 15:00:00', 1),
('ORD-2024-034', 5, 'Silvia Romero', 3, 108, 142, 8, 'cm', 9.2, '2024-10-16 11:00:00', 'delivered', 2, '2024-10-11 10:00:00', '2024-10-13 08:00:00', '2024-10-16 12:00:00', '2024-10-16 14:00:00', 1),
('ORD-2024-035', 6, 'Tomás Aguilar', 1, 135, 165, 10, 'cm', 5.9, '2024-10-19 10:00:00', 'delivered', 1, '2024-10-14 11:00:00', '2024-10-17 08:00:00', '2024-10-19 11:00:00', '2024-10-19 13:00:00', 1),
('ORD-2024-036', 7, 'Valeria Núñez', 1, 270, 242, 62, 'cm', 16.8, '2024-10-22 15:00:00', 'delivered', 1, '2024-10-16 10:00:00', '2024-10-19 08:00:00', '2024-10-22 16:00:00', '2024-10-22 18:00:00', 1),
('ORD-2024-037', 8, 'Xavier Fuentes', 1, 420, 255, 62, 'cm', 34.8, '2024-10-27 12:00:00', 'delivered', 2, '2024-10-19 09:00:00', '2024-10-23 08:00:00', '2024-10-27 13:00:00', '2024-10-27 16:00:00', 1),
('ORD-2024-038', 1, 'Yolanda Ibarra', 1, 115, 78, 43, 'cm', 8.2, '2024-10-30 10:00:00', 'delivered', 1, '2024-10-25 10:00:00', '2024-10-28 08:00:00', '2024-10-30 11:00:00', '2024-10-30 13:00:00', 1),
('ORD-2024-039', 2, 'Zacarías Ponce', 2, 165, 98, 56, 'cm', 36.5, '2024-11-03 14:00:00', 'delivered', 1, '2024-10-28 11:00:00', '2024-10-31 08:00:00', '2024-11-03 15:00:00', '2024-11-04 09:00:00', 1),
('ORD-2024-040', 3, 'Adriana Cortés', 3, 89, 207, 4, 'cm', 12.3, '2024-11-06 11:00:00', 'delivered', 2, '2024-11-01 09:00:00', '2024-11-03 08:00:00', '2024-11-06 12:00:00', '2024-11-06 14:00:00', 1);

-- Generar 10 pedidos EN ESPERA (pending o in_progress)
-- Estos están en la cola actual

INSERT INTO orders (
    order_number, product_type_id, customer_name, quantity,
    width, height, depth, dimension_unit,
    estimated_production_time, estimated_delivery_date,
    status, priority, order_date, start_production_date, created_by
) VALUES
-- En producción
('ORD-2024-041', 1, 'Bruno Salazar', 2, 130, 85, 47, 'cm', 17.2, CURRENT_TIMESTAMP + interval '1 day', 'in_progress', 2, CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '1 day', 1),
('ORD-2024-042', 4, 'Carla Mendez', 1, 98, 218, 6, 'cm', 7.3, CURRENT_TIMESTAMP + interval '2 days', 'in_progress', 1, CURRENT_TIMESTAMP - interval '3 days', CURRENT_TIMESTAMP - interval '1 day', 1),

-- Pendientes
('ORD-2024-043', 2, 'Diego Ramos', 1, 175, 108, 59, 'cm', 19.8, CURRENT_TIMESTAMP + interval '3 days', 'pending', 1, CURRENT_TIMESTAMP - interval '1 day', NULL, 1),
('ORD-2024-044', 5, 'Eva Castillo', 4, 118, 152, 9, 'cm', 13.5, CURRENT_TIMESTAMP + interval '4 days', 'pending', 1, CURRENT_TIMESTAMP - interval '1 day', NULL, 1),
('ORD-2024-045', 3, 'Felipe Márquez', 2, 90, 210, 5, 'cm', 8.3, CURRENT_TIMESTAMP + interval '5 days', 'pending', 3, CURRENT_TIMESTAMP, NULL, 1),
('ORD-2024-046', 6, 'Gabriela Ochoa', 2, 142, 172, 11, 'cm', 11.5, CURRENT_TIMESTAMP + interval '6 days', 'pending', 1, CURRENT_TIMESTAMP, NULL, 1),
('ORD-2024-047', 7, 'Hugo Delgado', 1, 265, 243, 63, 'cm', 16.5, CURRENT_TIMESTAMP + interval '7 days', 'pending', 2, CURRENT_TIMESTAMP + interval '1 hour', NULL, 1),
('ORD-2024-048', 8, 'Irene Valdez', 1, 410, 252, 61, 'cm', 33.2, CURRENT_TIMESTAMP + interval '9 days', 'pending', 1, CURRENT_TIMESTAMP + interval '2 hours', NULL, 1),
('ORD-2024-049', 1, 'Javier Montoya', 3, 122, 81, 44, 'cm', 25.2, CURRENT_TIMESTAMP + interval '12 days', 'pending', 1, CURRENT_TIMESTAMP + interval '3 hours', NULL, 1),
('ORD-2024-050', 2, 'Karen Espinoza', 1, 168, 102, 57, 'cm', 18.9, CURRENT_TIMESTAMP + interval '14 days', 'pending', 1, CURRENT_TIMESTAMP + interval '4 hours', NULL, 1);

-- Actualizar secuencia para próximos pedidos
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- Mostrar resumen
SELECT 
    status,
    COUNT(*) as total,
    SUM(estimated_production_time) as total_hours
FROM orders
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'in_progress' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'delivered' THEN 4
    END;
