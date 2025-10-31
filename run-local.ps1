# Script para ejecutar la aplicación localmente (sin Docker)
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Ejecutando Aplicación en Modo Local" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "IMPORTANTE: Asegúrate de que PostgreSQL esté corriendo" -ForegroundColor Yellow
Write-Host "Si tienes Docker funcionando, puedes iniciar solo PostgreSQL:" -ForegroundColor Yellow
Write-Host "  docker-compose up -d postgres" -ForegroundColor White
Write-Host ""

$response = Read-Host "¿PostgreSQL está corriendo? (s/n)"
if ($response -ne "s" -and $response -ne "S") {
    Write-Host "Por favor inicia PostgreSQL primero" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Instalando dependencias (si es necesario)..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm install
}
Write-Host "[OK] Dependencias listas" -ForegroundColor Green

Write-Host ""
Write-Host "2. Iniciando servidor backend y frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  Aplicación Iniciada" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

# Ejecutar en modo desarrollo
npm run dev:full
