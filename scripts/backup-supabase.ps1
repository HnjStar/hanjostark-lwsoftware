# Vollständiges SQL-Backup der Supabase-PostgreSQL-Datenbank nach backups/
# Benötigt: pg_dump (PostgreSQL Client Tools) im PATH
#
# 1) In Supabase: Project Settings → Database → Connection string (URI), Passwort eintragen
# 2) In PowerShell:
#    $env:SUPABASE_DB_URL = "postgresql://postgres:PASSWORT@db.<ref>.supabase.co:5432/postgres?sslmode=require"
# 3) Dieses Skript ausführen:
#    .\scripts\backup-supabase.ps1

param(
    [string]$DatabaseUrl = $env:SUPABASE_DB_URL
)

$ErrorActionPreference = "Stop"

if (-not $DatabaseUrl -or $DatabaseUrl.Trim() -eq "") {
    Write-Host ""
    Write-Host "FEHLER: Umgebungsvariable SUPABASE_DB_URL ist nicht gesetzt." -ForegroundColor Red
    Write-Host "Beispiel:" -ForegroundColor Yellow
    Write-Host '  $env:SUPABASE_DB_URL = "postgresql://postgres:DEIN_PASSWORT@db.bzshlphhsjwawuwikxxk.supabase.co:5432/postgres?sslmode=require"'
    Write-Host ""
    exit 1
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
    Write-Host ""
    Write-Host "FEHLER: pg_dump wurde nicht gefunden. PostgreSQL-Client installieren (PATH)." -ForegroundColor Red
    Write-Host "https://www.postgresql.org/download/windows/"
    Write-Host ""
    exit 1
}

# Skript liegt in <Projekt>/scripts/
$repoRoot = Split-Path -Parent $PSScriptRoot
$backupDir = Join-Path $repoRoot "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$outFile = Join-Path $backupDir "supabase-backup_$timestamp.sql"

Write-Host "Erstelle Backup: $outFile" -ForegroundColor Cyan

# Schema + Daten, ohne Owner (portabler)
& pg_dump --dbname=$DatabaseUrl -F p --no-owner --no-acl -f $outFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "pg_dump ist fehlgeschlagen (Exitcode $LASTEXITCODE)." -ForegroundColor Red
    exit $LASTEXITCODE
}

$size = (Get-Item $outFile).Length / 1KB
Write-Host "Fertig: $([math]::Round($size, 1)) KB" -ForegroundColor Green
Write-Host $outFile
