# Script para ejecutar migracion de base de datos
Write-Host "=== Ejecutando Migracion de Base de Datos ===" -ForegroundColor Cyan
Write-Host ""

# Leer configuracion
$envContent = Get-Content ".env"
$dbName = ($envContent | Select-String "VITE_DB_NAME=").ToString().Split("=")[1]
$dbUser = ($envContent | Select-String "VITE_DB_USER=").ToString().Split("=")[1]
$dbPassword = ($envContent | Select-String "VITE_DB_PASSWORD=").ToString().Split("=")[1]

# Buscar psql.exe
$psqlPath = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if (-Not $psqlPath) {
    Write-Host "Error: No se encontro psql.exe" -ForegroundColor Red
    exit 1
}

Write-Host "Ejecutando migracion..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPassword

& $psqlPath -U $dbUser -d $dbName -f "database\migration_productos.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migracion completada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nuevas tablas creadas:" -ForegroundColor Cyan
    Write-Host "  - product_types" -ForegroundColor White
    Write-Host "  - orders" -ForegroundColor White
    Write-Host "  - production_queue" -ForegroundColor White
    Write-Host "  - production_capacity" -ForegroundColor White
    Write-Host ""
    Write-Host "Reinicia el servidor: npm run dev:full" -ForegroundColor Yellow
} else {
    Write-Host "Error en la migracion" -ForegroundColor Red
    exit 1
}
