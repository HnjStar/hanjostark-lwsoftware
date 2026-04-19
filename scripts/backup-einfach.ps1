# Einfacher SQL-Abzug nach backups\ (eine .sql-Datei mit Zeitstempel)
#
# Voraussetzung: PostgreSQL installiert → pg_dump im PATH
#
# Verbindung (eine der drei Varianten):
#   A) Vor dem Start:  $env:SUPABASE_DB_URL = "postgresql://postgres:PASS@db....supabase.co:5432/postgres?sslmode=require"
#   B) Datei anlegen:  backups\db-url.txt  (eine Zeile = dieselbe URI)  → siehe db-url.txt.example
#   C) Skript fragt nach der URI, wenn weder A noch B gesetzt ist

$ErrorActionPreference = "Stop"

function Get-DbUrl {
    if ($env:SUPABASE_DB_URL -and $env:SUPABASE_DB_URL.Trim() -ne "") {
        return $env:SUPABASE_DB_URL.Trim()
    }
    $urlFile = Join-Path (Split-Path -Parent $PSScriptRoot) "backups\db-url.txt"
    if (Test-Path $urlFile) {
        $line = (Get-Content $urlFile -Raw -Encoding UTF8).Trim()
        $first = ($line -split "`n")[0].Trim()
        if ($first) { return $first }
    }
    Write-Host ""
    Write-Host "PostgreSQL-URI einfügen (aus Supabase: Database → Connection string → URI):" -ForegroundColor Yellow
    Write-Host "Beispiel: postgresql://postgres:PASSWORT@db.xxxxx.supabase.co:5432/postgres?sslmode=require" -ForegroundColor DarkGray
    $u = Read-Host "URI"
    if (-not $u -or $u.Trim() -eq "") {
        Write-Host "Abbruch." -ForegroundColor Red
        exit 1
    }
    return $u.Trim()
}

$dbUrl = Get-DbUrl

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    Write-Host "pg_dump fehlt. PostgreSQL-Client installieren: https://www.postgresql.org/download/windows/" -ForegroundColor Red
    exit 1
}

$projekt = Split-Path -Parent $PSScriptRoot
$zielOrdner = Join-Path $projekt "backups"
if (-not (Test-Path $zielOrdner)) { New-Item -ItemType Directory -Path $zielOrdner | Out-Null }

$name = "abzug_" + (Get-Date -Format "yyyy-MM-dd_HHmmss") + ".sql"
$pfad = Join-Path $zielOrdner $name

Write-Host "Schreibe: $pfad" -ForegroundColor Cyan

& pg_dump --dbname="$dbUrl" -F p --no-owner --no-acl -f $pfad
if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler bei pg_dump." -ForegroundColor Red
    exit $LASTEXITCODE
}

$kb = [math]::Round((Get-Item $pfad).Length / 1KB, 1)
Write-Host "Fertig: $kb KB" -ForegroundColor Green
Write-Host $pfad
