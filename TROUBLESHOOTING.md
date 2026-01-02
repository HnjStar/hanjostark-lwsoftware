# Fehlerbehebung - Registrierung

## Problem: Kann keinen neuen Account anlegen

### Mögliche Ursachen und Lösungen:

### 1. E-Mail-Bestätigung ist aktiviert

**Problem:** Supabase erfordert E-Mail-Bestätigung, bevor sich ein Benutzer anmelden kann.

**Lösung A: E-Mail-Bestätigung deaktivieren (für Entwicklung/Test)**

1. Gehen Sie zu: https://bzshlphhsjwawuwikxxk.supabase.co
2. Gehen Sie zu **Authentication** → **Settings** (oder **Policies**)
3. Suchen Sie nach **"Enable email confirmations"** oder **"Confirm email"**
4. Deaktivieren Sie die E-Mail-Bestätigung
5. Speichern Sie die Änderungen

**Lösung B: E-Mail-Bestätigung aktiv lassen (empfohlen für Production)**

- Nach der Registrierung wird eine E-Mail gesendet
- Der Benutzer muss auf den Link in der E-Mail klicken
- Dann kann er sich anmelden

### 2. E-Mail bereits registriert

**Fehlermeldung:** "User already registered"

**Lösung:**
- Verwenden Sie eine andere E-Mail-Adresse
- Oder melden Sie sich mit der bestehenden E-Mail an
- Oder setzen Sie das Passwort zurück

### 3. Passwort zu kurz

**Fehlermeldung:** "Password should be at least 6 characters"

**Lösung:**
- Verwenden Sie ein Passwort mit mindestens 6 Zeichen

### 4. Supabase Auth-Einstellungen prüfen

1. Gehen Sie zu Supabase Dashboard
2. **Authentication** → **Providers**
3. Stellen Sie sicher, dass **Email** aktiviert ist
4. Prüfen Sie die **Site URL** (sollte Ihre Vercel-URL sein)

### 5. Browser-Konsole prüfen

1. Öffnen Sie die Entwicklertools (F12)
2. Gehen Sie zum Tab **Console**
3. Versuchen Sie sich zu registrieren
4. Prüfen Sie auf rote Fehlermeldungen
5. Teilen Sie die Fehlermeldung mit, falls das Problem weiterhin besteht

### 6. Supabase Logs prüfen

1. Gehen Sie zu Supabase Dashboard
2. **Logs** → **Auth Logs**
3. Prüfen Sie die Fehlermeldungen bei der Registrierung

## Häufige Fehlermeldungen

| Fehlermeldung | Lösung |
|--------------|--------|
| "User already registered" | E-Mail ist bereits registriert, bitte anmelden |
| "Email not confirmed" | E-Mail-Bestätigung erforderlich, Postfach prüfen |
| "Invalid login credentials" | Falsche E-Mail oder Passwort |
| "Password should be at least 6 characters" | Passwort muss mindestens 6 Zeichen haben |
| "Invalid email" | E-Mail-Format ist ungültig |

## Test-Registrierung

Versuchen Sie es mit:
- **E-Mail:** test@example.com
- **Passwort:** test123456

Falls das funktioniert, liegt das Problem bei der spezifischen E-Mail-Adresse.

## Hilfe

Falls das Problem weiterhin besteht:
1. Prüfen Sie die Browser-Konsole (F12)
2. Prüfen Sie die Supabase Auth Logs
3. Teilen Sie die genaue Fehlermeldung mit
