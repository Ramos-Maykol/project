# Script de despliegue rápido sin n8n
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Despliegue Rápido (Sin n8n)" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
docker ps 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker no está corriendo" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Docker está corriendo" -ForegroundColor Green

# Build del frontend localmente
Write-Host ""
Write-Host "2. Compilando frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Error compilando frontend" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Frontend compilado" -ForegroundColor Green

# Detener contenedores
Write-Host ""
Write-Host "3. Deteniendo contenedores anteriores..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down
Write-Host "[OK] Contenedores detenidos" -ForegroundColor Green

# Usar dockerignore correcto
Write-Host ""
Write-Host "4. Preparando build..." -ForegroundColor Yellow
Copy-Item -Path ".dockerignore" -Destination ".dockerignore.backup" -Force -ErrorAction SilentlyContinue
Copy-Item -Path ".dockerignore.simple" -Destination ".dockerignore" -Force

# Construir imagen
Write-Host "5. Construyendo imagen Docker..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml build app
$buildResult = $LASTEXITCODE

# Restaurar dockerignore original
Copy-Item -Path ".dockerignore.backup" -Destination ".dockerignore" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".dockerignore.backup" -Force -ErrorAction SilentlyContinue

if ($buildResult -ne 0) {
    Write-Host "[X] Error en el build" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Imagen construida" -ForegroundColor Green

# Iniciar servicios
Write-Host ""
Write-Host "6. Iniciando servicios..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Error iniciando servicios" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Servicios iniciados" -ForegroundColor Green

# Esperar
Write-Host ""
Write-Host "7. Esperando a que la aplicación esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar logs
Write-Host ""
Write-Host "8. Verificando logs..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml logs --tail=20 app

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  Despliegue Completado" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Aplicación disponible en: http://localhost" -ForegroundColor Cyan
Write-Host "API disponible en: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Yellow
Write-Host "  Ver logs: docker-compose -f docker-compose.simple.yml logs -f app" -ForegroundColor White
Write-Host "  Detener: docker-compose -f docker-compose.simple.yml down" -ForegroundColor White
Write-Host ""
