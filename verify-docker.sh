#!/bin/bash
# Script de verificación de Docker
# Verifica que todos los servicios estén funcionando correctamente

echo "🔍 Verificando servicios Docker..."
echo ""

# Verificar que Docker esté corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo"
    exit 1
fi

echo "✅ Docker está corriendo"

# Verificar estado de los contenedores
echo ""
echo "📊 Estado de los contenedores:"
docker-compose ps

# Verificar salud de PostgreSQL
echo ""
echo "🔍 Verificando PostgreSQL..."
if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
    echo "✅ PostgreSQL está funcionando"
else
    echo "❌ PostgreSQL no responde"
fi

# Verificar API Backend
echo ""
echo "🔍 Verificando API Backend..."
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ API Backend está funcionando"
    response=$(curl -s http://localhost:3000/api/health)
    echo "   Response: $response"
else
    echo "❌ API Backend no responde"
fi

# Verificar Nginx
echo ""
echo "🔍 Verificando Nginx..."
if curl -s -f http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx está funcionando"
else
    echo "❌ Nginx no responde"
fi

# Verificar n8n
echo ""
echo "🔍 Verificando n8n..."
if curl -s http://localhost:5678 > /dev/null 2>&1; then
    echo "✅ n8n está funcionando"
else
    echo "❌ n8n no responde"
fi

# Verificar volúmenes
echo ""
echo "📦 Volúmenes Docker:"
docker volume ls | grep project

# Resumen
echo ""
echo "============================================================"
echo "RESUMEN DE VERIFICACIÓN"
echo "============================================================"
echo ""
echo "URLs de acceso:"
echo "  • Aplicación:  http://localhost"
echo "  • API:         http://localhost/api/health"
echo "  • n8n:         http://localhost/n8n"
echo "  • PostgreSQL:  localhost:5432"
echo ""
echo "Comandos útiles:"
echo "  • Ver logs:    docker-compose logs -f"
echo "  • Reiniciar:   docker-compose restart"
echo "  • Detener:     docker-compose down"
echo ""
