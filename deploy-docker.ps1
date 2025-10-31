# Script de despliegue Docker para Sistema de Produccion Manufacturera
# Incluye las correcciones del endpoint estimate-delivery

Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Sistema de Prediccion de Produccion - Despliegue Docker  " -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "   [X] Docker no esta instalado" -ForegroundColor Red
    Write-Host "   Descarga: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [X] Docker no esta corriendo" -ForegroundColor Red
    Write-Host "   Inicia Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
    exit 1
}
Write-Host "   [OK] Docker esta listo" -ForegroundColor Green

# 2. Preparar archivo .env
Write-Host ""
Write-Host "2. Configurando variables de entorno..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.docker" ".env"
    Write-Host "   [OK] Archivo .env creado desde .env.docker" -ForegroundColor Green
} else {
    Write-Host "   [OK] Archivo .env ya existe" -ForegroundColor Green
}

# 3. Detener contenedores existentes
Write-Host ""
Write-Host "3. Limpiando contenedores anteriores..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "   [OK] Contenedores anteriores detenidos" -ForegroundColor Green

# 4. Construir imágenes
Write-Host ""
Write-Host "4. Construyendo imágenes Docker..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar varios minutos la primera vez)" -ForegroundColor Gray
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [X] Error al construir las imagenes" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Imagenes construidas exitosamente" -ForegroundColor Green

# 5. Iniciar servicios
Write-Host ""
Write-Host "5. Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "   [X] Error al iniciar los servicios" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Servicios iniciados" -ForegroundColor Green

# 6. Esperar a que los servicios estén listos
Write-Host ""
Write-Host "6. Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Write-Host "   PostgreSQL inicializando..." -ForegroundColor Gray
Start-Sleep -Seconds 15

Write-Host "   Aplicacion iniciando..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# 7. Verificar estado
Write-Host ""
Write-Host "7. Verificando estado de los servicios..." -ForegroundColor Yellow
Write-Host ""
docker-compose ps

# 8. Verificar logs de la aplicación
Write-Host ""
Write-Host "8. Verificando logs de la aplicación..." -ForegroundColor Yellow
Write-Host ""
docker-compose logs --tail=20 app

# 9. Información de acceso
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Accede a los servicios en:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Aplicacion Web:      http://localhost" -ForegroundColor White
Write-Host "   API Backend:         http://localhost/api/health" -ForegroundColor White
Write-Host "   n8n Automatizacion:  http://localhost/n8n" -ForegroundColor White
Write-Host "   PostgreSQL:          localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales por defecto:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Admin:    admin@manufactura.com / admin123" -ForegroundColor White
Write-Host "   Operador: operador@manufactura.com / operador123" -ForegroundColor White
Write-Host "   n8n:      admin / admin123" -ForegroundColor White
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Ver logs en tiempo real:  docker-compose logs -f" -ForegroundColor White
Write-Host "   Ver logs de la app:       docker-compose logs -f app" -ForegroundColor White
Write-Host "   Ver logs de la BD:        docker-compose logs -f postgres" -ForegroundColor White
Write-Host "   Detener servicios:        docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar servicios:      docker-compose restart" -ForegroundColor White
Write-Host "   Ver estado:               docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "Documentacion:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   DOCKER_DEPLOYMENT.md - Guía completa de Docker" -ForegroundColor White
Write-Host "   README.md - Documentación general" -ForegroundColor White
Write-Host ""
Write-Host "Nota: Las correcciones del endpoint /api/orders/estimate-delivery" -ForegroundColor Yellow
Write-Host "   estan incluidas en este despliegue." -ForegroundColor Yellow
Write-Host ""
