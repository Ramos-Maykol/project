# Script de inicio rápido para Docker en Windows
# Sistema de Predicción de Producción Manufacturera

Write-Host "Iniciando Sistema de Producción con Docker..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker no está instalado. Por favor instala Docker Desktop." -ForegroundColor Red
    Write-Host "   Descarga: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar si Docker está corriendo
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "Docker está instalado y corriendo" -ForegroundColor Green

# Verificar si existe .env, si no, copiar desde .env.docker
if (-not (Test-Path ".env")) {
    Write-Host "Creando archivo .env desde .env.docker..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env"
    Write-Host "Archivo .env creado" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Revisa y actualiza las contraseñas en .env antes de producción" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Archivo .env encontrado" -ForegroundColor Green
}

# Preguntar si desea reconstruir las imágenes
Write-Host ""
$rebuild = Read-Host "¿Deseas reconstruir las imágenes? (s/N)"
if ($rebuild -eq "s" -or $rebuild -eq "S") {
    Write-Host "Reconstruyendo imágenes..." -ForegroundColor Cyan
    docker-compose build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al reconstruir las imágenes" -ForegroundColor Red
        exit 1
    }
}

# Iniciar servicios
Write-Host ""
Write-Host "Iniciando servicios..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al iniciar los servicios" -ForegroundColor Red
    exit 1
}

# Esperar a que los servicios estén listos
Write-Host ""
Write-Host "Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar estado de los servicios
Write-Host ""
Write-Host "Estado de los servicios:" -ForegroundColor Cyan
docker-compose ps

# Mostrar información de acceso
Write-Host ""
Write-Host "¡Sistema iniciado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Accede a los servicios en:" -ForegroundColor Cyan
Write-Host "   • Aplicación principal: http://localhost" -ForegroundColor White
Write-Host "   • API Backend:          http://localhost/api/health" -ForegroundColor White
Write-Host "   • n8n (Automatización): http://localhost/n8n" -ForegroundColor White
Write-Host "   • PostgreSQL:           localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Usuarios por defecto:" -ForegroundColor Cyan
Write-Host "   • Admin:    admin@manufactura.com / admin123" -ForegroundColor White
Write-Host "   • Operador: operador@manufactura.com / operador123" -ForegroundColor White
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Cyan
Write-Host "   • Ver logs:     docker-compose logs -f" -ForegroundColor White
Write-Host "   • Detener:      docker-compose down" -ForegroundColor White
Write-Host "   • Reiniciar:    docker-compose restart" -ForegroundColor White
Write-Host "   • Estado:       docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "Documentación completa: DOCKER_DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""
