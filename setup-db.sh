#!/bin/bash
# Script de configuración de base de datos PostgreSQL
# Ejecutar con: ./setup-db.sh

echo "=== Configuración de Base de Datos PostgreSQL ==="
echo ""

# Verificar si existe .env
if [ ! -f ".env" ]; then
    echo "Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✓ Archivo .env creado. Por favor, edítalo con tus credenciales."
    echo ""
else
    echo "✓ Archivo .env ya existe."
    echo ""
fi

# Leer configuración del .env
echo "Leyendo configuración de .env..."
source .env

echo "Base de datos: $VITE_DB_NAME"
echo "Usuario: $VITE_DB_USER"
echo ""

# Preguntar si desea crear la base de datos
read -p "¿Deseas crear la base de datos '$VITE_DB_NAME'? (s/n): " createDb

if [ "$createDb" = "s" ] || [ "$createDb" = "S" ]; then
    echo ""
    echo "Creando base de datos..."
    
    # Crear base de datos
    export PGPASSWORD=$VITE_DB_PASSWORD
    createdb -U $VITE_DB_USER -h $VITE_DB_HOST -p $VITE_DB_PORT $VITE_DB_NAME 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✓ Base de datos '$DB_NAME' creada exitosamente."
    else
        echo "⚠ La base de datos ya existe o hubo un error."
    fi
    
    echo ""
    echo "Inicializando tablas..."
    
    # Ejecutar script de inicialización
    psql -U $VITE_DB_USER -h $VITE_DB_HOST -p $VITE_DB_PORT -d $VITE_DB_NAME -f database/init.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Tablas inicializadas exitosamente."
        echo ""
        echo "=== Configuración Completada ==="
        echo ""
        echo "Usuarios creados:"
        echo "  - admin@manufactura.com / admin123 (admin)"
        echo "  - operador@manufactura.com / operador123 (operator)"
        echo ""
        echo "Puedes iniciar el proyecto con: npm run dev"
    else
        echo "✗ Error al inicializar las tablas."
        echo "Por favor, verifica que PostgreSQL esté instalado y corriendo."
        exit 1
    fi
    
else
    echo "Configuración cancelada."
fi

echo ""
