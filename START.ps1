# Script de inicio rápido - Ejecuta la aplicación localmente
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Sistema de Predicción de Producción - Inicio Rápido" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script ejecutará:" -ForegroundColor Yellow
Write-Host "  - PostgreSQL en Docker" -ForegroundColor White
Write-Host "  - Backend y Frontend localmente (más rápido)" -ForegroundColor White
Write-Host ""

# Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
docker ps 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker no está corriendo" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Docker está corriendo" -ForegroundColor Green

# Iniciar solo PostgreSQL
Write-Host ""
Write-Host "2. Iniciando PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d postgres
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Error iniciando PostgreSQL" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] PostgreSQL iniciado" -ForegroundColor Green

# Esperar a que PostgreSQL esté listo
Write-Host ""
Write-Host "3. Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxAttempts = 10
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts -and -not $dbReady) {
    $attempt++
    docker exec manufactura-db pg_isready -U postgres 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
        Write-Host "[OK] PostgreSQL está listo" -ForegroundColor Green
    } else {
        Write-Host "   Intento $attempt/$maxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $dbReady) {
    Write-Host "[X] PostgreSQL no respondió a tiempo" -ForegroundColor Red
    exit 1
}

# Verificar dependencias
Write-Host ""
Write-Host "4. Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Dependencias listas" -ForegroundColor Green

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  Iniciando Aplicación" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Base de Datos: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

# Ejecutar aplicación
npm run dev:full
