# Landwirtschaft Software

Eine moderne Webanwendung zur Verwaltung von Pflanzenschutzmittel-Einträgen mit Supabase-Authentifizierung.

## Features

- 🔐 Sichere Authentifizierung mit Supabase
- 📝 Umfassendes Formular für Pflanzenschutzmittel-Einträge
- 📊 Übersichtliche Kachelansicht aller Einträge
- 📥 Excel-Export-Funktionalität
- 🎨 Moderne, benutzerfreundliche Oberfläche

## Installation

1. **Abhängigkeiten installieren:**
```bash
npm install
```

2. **Datenbank-Schema einrichten:**
   - Öffnen Sie die Supabase-Konsole: https://bzshlphhsjwawuwikxxk.supabase.co
   - Gehen Sie zu "SQL Editor"
   - Führen Sie den Inhalt der Datei `database-schema.sql` aus

3. **Entwicklungsserver starten:**
```bash
npm run dev
```

Die Anwendung ist dann unter `http://localhost:5173` erreichbar.

## Datenbank-Setup

Die Anwendung benötigt folgende Tabellen in Supabase:
- `users` - Benutzerdaten
- `verwendungsarten` - Arten der Verwendung
- `pflanzenschutzmittel` - Pflanzenschutzmittel mit Zulassungsnummern
- `kulturpflanzen` - Kulturpflanzen
- `flaechen` - Flächen mit Alias, FID und GPS-Daten
- `eppo_codes` - EPPO Codes
- `bbch_stadien` - BBCH Stadien
- `eintraege` - Haupttabelle für alle Einträge

Alle Tabellen sind mit Row Level Security (RLS) geschützt, sodass Benutzer nur auf ihre eigenen Daten zugreifen können.

## Verwendung

1. **Registrierung/Anmeldung:**
   - Registrieren Sie sich mit einer E-Mail-Adresse und einem Passwort
   - Melden Sie sich an

2. **Neuen Eintrag anlegen:**
   - Klicken Sie auf "Neuer Eintrag"
   - Füllen Sie alle Felder aus
   - Sie können neue Optionen zu den Dropdown-Feldern hinzufügen, indem Sie auf das "+" Symbol klicken
   - Speichern Sie den Eintrag

3. **Einträge anzeigen:**
   - Alle Einträge werden in Kacheln angezeigt
   - Jede Kachel zeigt die wichtigsten Informationen

4. **Export:**
   - Klicken Sie auf "Alle exportieren (Excel)" für alle Einträge
   - Oder klicken Sie auf das Export-Symbol in einer einzelnen Kachel

## Technologie-Stack

- React 18
- TypeScript
- Vite
- Supabase (Authentifizierung & Datenbank)
- React Router
- date-fns (Datum-Formatierung)
- xlsx (Excel-Export)

## Projektstruktur

```
├── src/
│   ├── components/
│   │   ├── Login.tsx          # Anmeldekomponente
│   │   ├── Login.css
│   │   ├── Dashboard.tsx      # Hauptkomponente mit Formular und Übersicht
│   │   └── Dashboard.css
│   ├── lib/
│   │   └── supabase.ts        # Supabase Client Konfiguration
│   ├── App.tsx                # Haupt-App-Komponente mit Routing
│   ├── App.css
│   ├── main.tsx               # Einstiegspunkt
│   └── index.css              # Globale Styles
├── database-schema.sql        # SQL-Schema für Supabase
├── package.json
└── vite.config.ts
```

## Sicherheit

- Alle Datenbankzugriffe sind durch Row Level Security (RLS) geschützt
- Authentifizierung erfolgt verschlüsselt über Supabase
- Benutzer können nur auf ihre eigenen Einträge zugreifen
