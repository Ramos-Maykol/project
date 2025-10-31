# Script para corregir y redesplegar la aplicación Docker

Write-Host "🔧 Corrigiendo configuración y redesplegando..." -ForegroundColor Cyan

# 1. Copiar .env.docker a .env
Write-Host "`n📝 Copiando variables de entorno..." -ForegroundColor Yellow
Copy-Item .env.docker .env -Force

# 2. Detener contenedores existentes
Write-Host "`n🛑 Deteniendo contenedores..." -ForegroundColor Yellow
docker-compose down

# 3. Reconstruir imágenes
Write-Host "`n🏗️ Reconstruyendo imágenes..." -ForegroundColor Yellow
docker-compose build --no-cache app

# 4. Iniciar servicios
Write-Host "`n🚀 Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d

# 5. Verificar estado
Write-Host "`n⏳ Esperando 10 segundos para que los servicios inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n📊 Estado de los contenedores:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n📝 Logs de la aplicación:" -ForegroundColor Cyan
docker-compose logs --tail=50 app

Write-Host "`n✅ Despliegue completado!" -ForegroundColor Green
Write-Host "`n🌐 Aplicación disponible en: http://localhost:3000" -ForegroundColor Green
Write-Host "🔐 Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   Admin: admin@manufactura.com / admin123" -ForegroundColor White
Write-Host "   Operador: operador@manufactura.com / operador123" -ForegroundColor White

Write-Host "`n📌 Para ver logs en tiempo real:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f app" -ForegroundColor White
