# Script de configuración de base de datos PostgreSQL para Windows
# Ejecutar con: .\setup-db.ps1

Write-Host "=== Configuración de Base de Datos PostgreSQL ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe .env
if (-Not (Test-Path ".env")) {
    Write-Host "Creando archivo .env desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Archivo .env creado. Por favor, edítalo con tus credenciales." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✓ Archivo .env ya existe." -ForegroundColor Green
    Write-Host ""
}

# Leer configuración del .env
Write-Host "Leyendo configuración de .env..." -ForegroundColor Yellow
$envContent = Get-Content ".env"
$dbName = ($envContent | Select-String "VITE_DB_NAME=").ToString().Split("=")[1]
$dbUser = ($envContent | Select-String "VITE_DB_USER=").ToString().Split("=")[1]

Write-Host "Base de datos: $dbName" -ForegroundColor Cyan
Write-Host "Usuario: $dbUser" -ForegroundColor Cyan
Write-Host ""

# Preguntar si desea crear la base de datos
$createDb = Read-Host "¿Deseas crear la base de datos '$dbName'? (s/n)"

if ($createDb -eq "s" -or $createDb -eq "S") {
    Write-Host ""
    Write-Host "Creando base de datos..." -ForegroundColor Yellow
    
    # Crear base de datos
    $createDbCmd = "CREATE DATABASE $dbName;"
    $env:PGPASSWORD = (($envContent | Select-String "VITE_DB_PASSWORD=").ToString().Split("=")[1])
    
    # Buscar psql.exe
    $psqlPath = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    
    if (-Not $psqlPath) {
        Write-Host "✗ No se encontró psql.exe. Por favor, instala PostgreSQL." -ForegroundColor Red
        exit 1
    }
    
    try {
        & $psqlPath -U $dbUser -c $createDbCmd 2>&1 | Out-Null
        Write-Host "✓ Base de datos '$dbName' creada exitosamente." -ForegroundColor Green
    } catch {
        Write-Host "⚠ La base de datos ya existe o hubo un error." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Inicializando tablas..." -ForegroundColor Yellow
    
    # Ejecutar script de inicialización
    try {
        & $psqlPath -U $dbUser -d $dbName -f "database\init.sql"
        Write-Host ""
        Write-Host "✓ Tablas inicializadas exitosamente." -ForegroundColor Green
    } catch {
        Write-Host "✗ Error al inicializar las tablas." -ForegroundColor Red
        Write-Host "Por favor, verifica que PostgreSQL esté instalado y corriendo." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "=== Configuración Completada ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usuarios creados:" -ForegroundColor Cyan
    Write-Host "  - admin@manufactura.com / admin123 (admin)" -ForegroundColor White
    Write-Host "  - operador@manufactura.com / operador123 (operator)" -ForegroundColor White
    Write-Host ""
    Write-Host "Puedes iniciar el proyecto con: npm run dev" -ForegroundColor Yellow
    
} else {
    Write-Host "Configuración cancelada." -ForegroundColor Yellow
}

Write-Host ""
