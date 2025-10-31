# Script de verificación de Docker
# Verifica que todos los servicios estén funcionando correctamente

Write-Host "🔍 Verificando servicios Docker..." -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté corriendo
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker no está corriendo" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker está corriendo" -ForegroundColor Green

# Verificar estado de los contenedores
Write-Host ""
Write-Host "📊 Estado de los contenedores:" -ForegroundColor Cyan
docker-compose ps

# Verificar salud de PostgreSQL
Write-Host ""
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Cyan
docker-compose exec -T postgres pg_isready -U postgres 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL está funcionando" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL no responde" -ForegroundColor Red
}

# Verificar API Backend
Write-Host ""
Write-Host "🔍 Verificando API Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API Backend está funcionando" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Database: $($content.database)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ API Backend no responde" -ForegroundColor Red
}

# Verificar Nginx
Write-Host ""
Write-Host "🔍 Verificando Nginx..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Nginx está funcionando" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Nginx no responde" -ForegroundColor Red
}

# Verificar n8n
Write-Host ""
Write-Host "🔍 Verificando n8n..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5678" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401) {
        Write-Host "✅ n8n está funcionando" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ n8n no responde" -ForegroundColor Red
}

# Verificar volúmenes
Write-Host ""
Write-Host "📦 Volúmenes Docker:" -ForegroundColor Cyan
docker volume ls | Select-String "project"

# Resumen
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor Yellow
Write-Host "  • Aplicación:  http://localhost" -ForegroundColor White
Write-Host "  • API:         http://localhost/api/health" -ForegroundColor White
Write-Host "  • n8n:         http://localhost/n8n" -ForegroundColor White
Write-Host "  • PostgreSQL:  localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Yellow
Write-Host "  • Ver logs:    docker-compose logs -f" -ForegroundColor White
Write-Host "  • Reiniciar:   docker-compose restart" -ForegroundColor White
Write-Host "  • Detener:     docker-compose down" -ForegroundColor White
Write-Host ""
