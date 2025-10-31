# Script para reiniciar Docker Desktop
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Reiniciando Docker Desktop" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Deteniendo procesos de Docker..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.backend" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.proxy" -Force -ErrorAction SilentlyContinue

Write-Host "[OK] Procesos detenidos" -ForegroundColor Green

Write-Host ""
Write-Host "2. Esperando 5 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "3. Iniciando Docker Desktop..." -ForegroundColor Yellow

# Buscar la ruta de Docker Desktop
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

if (Test-Path $dockerPath) {
    Start-Process $dockerPath
    Write-Host "[OK] Docker Desktop iniciado" -ForegroundColor Green
} else {
    Write-Host "[X] No se encontró Docker Desktop en la ruta por defecto" -ForegroundColor Red
    Write-Host "Busca 'Docker Desktop' en el menú de inicio y ábrelo manualmente" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "4. Esperando a que Docker esté listo..." -ForegroundColor Yellow
Write-Host "   Esto puede tomar 30-60 segundos..." -ForegroundColor Gray

$maxAttempts = 30
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts -and -not $dockerReady) {
    Start-Sleep -Seconds 2
    $attempt++
    
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dockerReady = $true
        Write-Host "[OK] Docker está listo!" -ForegroundColor Green
    } else {
        Write-Host "   Intento $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if (-not $dockerReady) {
    Write-Host ""
    Write-Host "[!] Docker está tardando más de lo esperado" -ForegroundColor Yellow
    Write-Host "Verifica Docker Desktop manualmente y asegúrate de que:" -ForegroundColor Yellow
    Write-Host "  - El ícono de Docker en la bandeja del sistema esté verde" -ForegroundColor White
    Write-Host "  - No haya mensajes de error en Docker Desktop" -ForegroundColor White
    Write-Host "  - WSL 2 esté funcionando correctamente" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  Docker Desktop Reiniciado Exitosamente" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes ejecutar: .\quick-redeploy.ps1" -ForegroundColor Cyan
Write-Host ""
