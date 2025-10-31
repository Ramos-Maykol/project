# Script para aplicar la migración de autenticación
# Sistema de Producción Manufacturera

Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Aplicando Migración de Autenticación y Roles" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está corriendo
docker ps 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker no está corriendo" -ForegroundColor Red
    Write-Host "Inicia Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Verificando contenedor de PostgreSQL..." -ForegroundColor Yellow
$container = docker ps --filter "name=manufactura-db" --format "{{.Names}}"

if (-not $container) {
    Write-Host "[X] El contenedor de PostgreSQL no está corriendo" -ForegroundColor Red
    Write-Host "Ejecuta: docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Contenedor encontrado: $container" -ForegroundColor Green

Write-Host ""
Write-Host "2. Aplicando migración de autenticación..." -ForegroundColor Yellow

# Aplicar la migración
Get-Content database/04-auth-system.sql | docker exec -i $container psql -U postgres -d manufactura_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Migración aplicada exitosamente" -ForegroundColor Green
} else {
    Write-Host "[X] Error aplicando migración" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Verificando tablas creadas..." -ForegroundColor Yellow

$tables = docker exec $container psql -U postgres -d manufactura_db -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('roles', 'users', 'sessions', 'product_type_audit') ORDER BY tablename;"

Write-Host "Tablas encontradas:" -ForegroundColor Cyan
Write-Host $tables

Write-Host ""
Write-Host "4. Verificando roles creados..." -ForegroundColor Yellow

$roles = docker exec $container psql -U postgres -d manufactura_db -t -c "SELECT name, description FROM roles ORDER BY id;"

Write-Host "Roles disponibles:" -ForegroundColor Cyan
Write-Host $roles

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  Migración Completada Exitosamente" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Usuarios de prueba creados:" -ForegroundColor Cyan
Write-Host "  Admin:    admin@manufactura.com / admin123" -ForegroundColor White
Write-Host "  Operador: operador@manufactura.com / operador123" -ForegroundColor White
Write-Host "  Cliente:  cliente@manufactura.com / cliente123" -ForegroundColor White
Write-Host ""
Write-Host "Nota: Las contraseñas deben ser hasheadas correctamente" -ForegroundColor Yellow
Write-Host "      Usa el endpoint /api/auth/register para crear usuarios reales" -ForegroundColor Yellow
Write-Host ""
