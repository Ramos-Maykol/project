-- Sistema de Modelos Predictivos para Manufactura
-- Base de datos SQLite con procedimientos almacenados simulados

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'operator')) NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de parámetros de producción
CREATE TABLE IF NOT EXISTS production_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Tabla de datos históricos de producción
CREATE TABLE IF NOT EXISTS production_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_material_available REAL NOT NULL,
    standard_process_time REAL NOT NULL,
    projected_demand REAL NOT NULL,
    actual_production REAL DEFAULT 0,
    efficiency_rate REAL DEFAULT 0,
    date DATE NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de predicciones
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    production_data_id INTEGER,
    predicted_production_time REAL NOT NULL,
    confidence_level REAL NOT NULL,
    model_used TEXT NOT NULL,
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (production_data_id) REFERENCES production_data(id)
);

-- Insertar usuarios por defecto
INSERT OR IGNORE INTO users (email, password, role, name) VALUES 
('admin@manufactura.com', 'admin123', 'admin', 'Administrador Sistema'),
('operador@manufactura.com', 'operador123', 'operator', 'Operador Producción');

-- Insertar parámetros de producción por defecto
INSERT OR IGNORE INTO production_parameters (name, value, unit, category, updated_by) VALUES 
('Capacidad Máxima Diaria', 1000, 'unidades', 'capacidad', 1),
('Tiempo Setup Máquina', 30, 'minutos', 'tiempo', 1),
('Eficiencia Objetivo', 85, 'porcentaje', 'eficiencia', 1),
('Costo Hora Máquina', 50, 'USD', 'costo', 1),
('Inventario Mínimo', 100, 'unidades', 'inventario', 1);

-- Insertar datos históricos de ejemplo
INSERT OR IGNORE INTO production_data (raw_material_available, standard_process_time, projected_demand, actual_production, efficiency_rate, date, created_by) VALUES 
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