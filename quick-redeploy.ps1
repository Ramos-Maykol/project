# Script de redespliegue rápido
# Solo reconstruye la aplicación sin caché completo

Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Redespliegue Rápido - Solo Aplicación" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
docker ps 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker no está corriendo" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Docker está corriendo" -ForegroundColor Green

# Detener solo la aplicación
Write-Host ""
Write-Host "2. Deteniendo aplicación..." -ForegroundColor Yellow
docker-compose stop app
docker-compose rm -f app

# Reconstruir solo la aplicación
Write-Host ""
Write-Host "3. Reconstruyendo aplicación..." -ForegroundColor Yellow
docker-compose build app

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Error en el build" -ForegroundColor Red
    exit 1
}

# Iniciar servicios
Write-Host ""
Write-Host "4. Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Error iniciando servicios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "5. Esperando a que la aplicación esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar logs
Write-Host ""
Write-Host "6. Verificando logs..." -ForegroundColor Yellow
docker-compose logs --tail=20 app

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  Redespliegue Completado" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Aplicación disponible en: http://localhost" -ForegroundColor Cyan
Write-Host "API disponible en: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver logs en tiempo real: docker-compose logs -f app" -ForegroundColor Yellow
Write-Host ""
