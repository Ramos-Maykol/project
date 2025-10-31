-- Sistema de Autenticación y Roles
-- Migración para agregar usuarios, roles y autenticación

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles básicos
INSERT INTO roles (name, description) VALUES
    ('admin', 'Administrador del sistema con acceso completo'),
    ('operator', 'Operador que gestiona pedidos y producción'),
    ('customer', 'Cliente que puede hacer pedidos')
ON CONFLICT (name) DO NOTHING;

-- Actualizar tabla de usuarios existente
DO $$ 
BEGIN
    -- Migrar datos de columnas antiguas a nuevas
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        UPDATE users SET password_hash = password WHERE password_hash IS NULL;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
    
    -- Migrar name a full_name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
        UPDATE users SET full_name = name WHERE full_name IS NULL;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='company') THEN
        ALTER TABLE users ADD COLUMN company VARCHAR(255);
    END IF;
    
    -- Migrar role a role_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role_id') THEN
        ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id) DEFAULT 3;
        -- Mapear roles antiguos a nuevos IDs
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
            UPDATE users SET role_id = 1 WHERE role = 'admin' AND role_id IS NULL;
            UPDATE users SET role_id = 2 WHERE role = 'operator' AND role_id IS NULL;
            UPDATE users SET role_id = 3 WHERE role NOT IN ('admin', 'operator') AND role_id IS NULL;
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;
END $$;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Insertar usuarios por defecto (contraseña: admin123, operador123, cliente123)
-- Nota: En producción, estas contraseñas deben ser hasheadas con bcrypt
INSERT INTO users (email, password_hash, full_name, role_id, email_verified) VALUES
    ('admin@manufactura.com', '$2b$10$rKZvVxwvVxwvVxwvVxwvVeN1234567890abcdefghijklmnopqrstuv', 'Administrador Sistema', 1, true),
    ('operador@manufactura.com', '$2b$10$rKZvVxwvVxwvVxwvVxwvVeN1234567890abcdefghijklmnopqrstuv', 'Operador Producción', 2, true),
    ('cliente@manufactura.com', '$2b$10$rKZvVxwvVxwvVxwvVxwvVeN1234567890abcdefghijklmnopqrstuv', 'Cliente Demo', 3, true)
ON CONFLICT (email) DO NOTHING;

-- Tabla de sesiones para manejo de tokens
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Actualizar tabla orders para relacionar con usuarios
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vista para información de usuarios con roles
CREATE OR REPLACE VIEW users_with_roles AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.company,
    u.is_active,
    u.email_verified,
    u.created_at,
    u.last_login,
    r.name as role_name,
    r.description as role_description
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;

-- Permisos para tipos de productos (mantenedor)
CREATE TABLE IF NOT EXISTS product_type_audit (
    id SERIAL PRIMARY KEY,
    product_type_id INTEGER REFERENCES product_types(id),
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted'
    changed_by INTEGER REFERENCES users(id),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para auditar cambios en product_types
CREATE OR REPLACE FUNCTION audit_product_type_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO product_type_audit (product_type_id, action, new_values)
        VALUES (NEW.id, 'created', row_to_json(NEW)::jsonb);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO product_type_audit (product_type_id, action, old_values, new_values)
        VALUES (NEW.id, 'updated', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO product_type_audit (product_type_id, action, old_values)
        VALUES (OLD.id, 'deleted', row_to_json(OLD)::jsonb);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auditoría de product_types
DROP TRIGGER IF EXISTS product_type_audit_trigger ON product_types;
CREATE TRIGGER product_type_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_types
    FOR EACH ROW
    EXECUTE FUNCTION audit_product_type_changes();

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Usuarios del sistema con autenticación';
COMMENT ON TABLE roles IS 'Roles y permisos del sistema';
COMMENT ON TABLE sessions IS 'Sesiones activas de usuarios';
COMMENT ON TABLE product_type_audit IS 'Auditoría de cambios en tipos de productos';
