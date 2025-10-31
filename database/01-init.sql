-- Script de inicialización de base de datos PostgreSQL
-- Sistema de Predicción de Producción Manufacturera

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE manufactura_db;

-- Conectar a la base de datos
-- \c manufactura_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de parámetros de producción
CREATE TABLE IF NOT EXISTS production_parameters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de datos de producción
CREATE TABLE IF NOT EXISTS production_data (
    id SERIAL PRIMARY KEY,
    raw_material_available NUMERIC(10, 2) NOT NULL,
    standard_process_time NUMERIC(10, 2) NOT NULL,
    projected_demand NUMERIC(10, 2) NOT NULL,
    actual_production NUMERIC(10, 2),
    efficiency_rate NUMERIC(5, 2),
    date DATE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de predicciones
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    raw_material_available NUMERIC(10, 2) NOT NULL,
    standard_process_time NUMERIC(10, 2) NOT NULL,
    projected_demand NUMERIC(10, 2) NOT NULL,
    predicted_production NUMERIC(10, 2) NOT NULL,
    confidence_level NUMERIC(5, 2) NOT NULL,
    prediction_date DATE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_production_data_date ON production_data(date);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insertar usuarios por defecto
INSERT INTO users (email, password, role, name) VALUES
    ('admin@manufactura.com', 'admin123', 'admin', 'Administrador Sistema'),
    ('operador@manufactura.com', 'operador123', 'operator', 'Operador Producción')
ON CONFLICT (email) DO NOTHING;

-- Insertar parámetros de producción por defecto
INSERT INTO production_parameters (name, value, unit, category, updated_by) VALUES
    ('Capacidad Máxima Diaria', 1000, 'unidades', 'capacidad', 1),
    ('Tiempo Setup Máquina', 30, 'minutos', 'tiempo', 1),
    ('Eficiencia Objetivo', 85, 'porcentaje', 'eficiencia', 1),
    ('Costo Hora Máquina', 50, 'USD', 'costo', 1),
    ('Inventario Mínimo', 100, 'unidades', 'inventario', 1);

-- Insertar datos de producción de ejemplo
INSERT INTO production_data (raw_material_available, standard_process_time, projected_demand, actual_production, efficiency_rate, date, created_by) VALUES
    (800, 8.5, 750, 720, 82.5, '2024-01-15', 2),
    (950, 7.8, 900, 885, 87.2, '2024-01-16', 2),
    (1200, 9.2, 1100, 1050, 79.8, '2024-01-17', 2),
    (750, 8.0, 700, 695, 85.1, '2024-01-18', 2),
    (1100, 7.5, 1000, 980, 88.9, '2024-01-19', 2),
    (900, 8.8, 850, 825, 83.7, '2024-01-20', 2),
    (1050, 7.2, 950, 940, 90.1, '2024-01-21', 2),
    (850, 9.0, 800, 775, 81.3, '2024-01-22', 2),
    (1150, 7.9, 1050, 1025, 86.8, '2024-01-23', 2),
    (950, 8.3, 900, 890, 84.6, '2024-01-24', 2);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente updated_at en production_parameters
CREATE TRIGGER update_production_parameters_updated_at 
    BEFORE UPDATE ON production_parameters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
