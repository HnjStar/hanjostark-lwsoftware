# Datenbank-Backups

Hier landen SQL-Dumps, wenn du das Skript `scripts/backup-supabase.ps1` ausführst.

**Hinweis:** Dateien in diesem Ordner sind per `.gitignore` von Git ausgeschlossen und werden **nicht** ins Repository hochgeladen.

## Voraussetzungen

1. **PostgreSQL-Client** (enthält `pg_dump`):  
   https://www.postgresql.org/download/windows/  
   Oder nur die „Command Line Tools“ installieren.

2. **Verbindungs-URI** aus Supabase:  
   **Project Settings → Database → Connection string → URI**  
   Passwort einsetzen. Am Ende oft `?sslmode=require` anhängen, falls nicht schon drin.

## Einfachster Weg

```powershell
cd "Pfad\zu\Landwirtschaft software Wolfgang"
.\scripts\backup-einfach.ps1
```

- Entweder vorher `$env:SUPABASE_DB_URL` setzen (siehe unten), **oder**
- eine Datei `backups\db-url.txt` anlegen (Inhalt von `db-url.txt.example` kopieren, URI eintragen – eine Zeile), **oder**
- beim Start die URI einfügen, wenn das Skript fragt.

Ergebnis: `backups\abzug_YYYY-MM-DD_HHmmss.sql`

## Alternative: `backup-supabase.ps1`

Nur mit Umgebungsvariable `SUPABASE_DB_URL`:

```powershell
$env:SUPABASE_DB_URL = "postgresql://postgres:DEIN_PASSWORT@db.bzshlphhsjwawuwikxxk.supabase.co:5432/postgres?sslmode=require"
.\scripts\backup-supabase.ps1
```

Die Datei erscheint als `supabase-backup_YYYY-MM-DD_HHmmss.sql`.

## Alternative: Supabase Dashboard

**Database → Backups** (je nach Plan) oder für einzelne Tabellen **Table Editor → Export**.
