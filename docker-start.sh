#!/bin/bash
# Script de inicio rápido para Docker en Linux/Mac
# Sistema de Predicción de Producción Manufacturera

echo "🐳 Iniciando Sistema de Producción con Docker..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker."
    echo "   Descarga: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar si Docker está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker."
    exit 1
fi

echo "✅ Docker está instalado y corriendo"

# Verificar si existe .env, si no, copiar desde .env.docker
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env desde .env.docker..."
    cp .env.docker .env
    echo "✅ Archivo .env creado"
    echo ""
    echo "⚠️  IMPORTANTE: Revisa y actualiza las contraseñas en .env antes de producción"
    echo ""
else
    echo "✅ Archivo .env encontrado"
fi

# Preguntar si desea reconstruir las imágenes
echo ""
read -p "¿Deseas reconstruir las imágenes? (s/N): " rebuild
if [ "$rebuild" = "s" ] || [ "$rebuild" = "S" ]; then
    echo "🔨 Reconstruyendo imágenes..."
    docker-compose build --no-cache
    if [ $? -ne 0 ]; then
        echo "❌ Error al reconstruir las imágenes"
        exit 1
    fi
fi

# Iniciar servicios
echo ""
echo "🚀 Iniciando servicios..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Error al iniciar los servicios"
    exit 1
fi

# Esperar a que los servicios estén listos
echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

# Mostrar información de acceso
echo ""
echo "✅ ¡Sistema iniciado correctamente!"
echo ""
echo "🌐 Accede a los servicios en:"
echo "   • Aplicación principal: http://localhost"
echo "   • API Backend:          http://localhost/api/health"
echo "   • n8n (Automatización): http://localhost/n8n"
echo "   • PostgreSQL:           localhost:5432"
echo ""
echo "👤 Usuarios por defecto:"
echo "   • Admin:    admin@manufactura.com / admin123"
echo "   • Operador: operador@manufactura.com / operador123"
echo ""
echo "📝 Comandos útiles:"
echo "   • Ver logs:     docker-compose logs -f"
echo "   • Detener:      docker-compose down"
echo "   • Reiniciar:    docker-compose restart"
echo "   • Estado:       docker-compose ps"
echo ""
echo "📖 Documentación completa: DOCKER_DEPLOYMENT.md"
echo ""
