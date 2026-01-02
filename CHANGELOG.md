# Änderungsprotokoll

## Version 2.0 - Filter & Neue Formular-Reihenfolge

### Neue Features

1. **Filter-Funktionalität in der Übersicht**
   - Filter nach Fläche (Alias)
   - Filter nach FID/Flurstücksnummer
   - Filter nach Zeitraum (Von/Bis Datum)
   - Gefilterte Ergebnisse exportieren
   - Filter zurücksetzen Funktion

2. **Neue Formular-Reihenfolge**
   - Art der Verwendung (bleibt)
   - **Fläche** (neu: als zweites Feld)
   - **Kulturpflanze** (neu: als drittes Feld)
   - **Pflanzenschutzmittel** (neu: als viertes Feld)
   - **Aufwandsmenge** (neu: als fünftes Feld)
   - **BBCH Stadium** (neu: als sechstes Feld)
   - Anwendungsdatum und Startzeitpunkt
   - Name und Vorname

3. **Kulturpflanze mit EPPO Code verknüpft**
   - Jede Kulturpflanze hat jetzt einen EPPO Code
   - EPPO Code wird automatisch gesetzt, wenn eine Kulturpflanze ausgewählt wird
   - Beim Hinzufügen einer neuen Kulturpflanze muss der EPPO Code angegeben werden
   - EPPO Code wird in der Übersicht angezeigt

### Datenbank-Änderungen

- `kulturpflanzen` Tabelle erweitert um `eppo_code` Spalte
- Siehe `database-migration.sql` für Migration bestehender Datenbanken

### Technische Änderungen

- Neue Filter-State-Variablen
- Filter-Logik mit useEffect Hook
- Kulturpflanze-Interface erweitert
- Export-Funktion unterstützt gefilterte Ergebnisse
- CSS für Filter-Section hinzugefügt

### Breaking Changes

⚠️ **Wichtig:** Wenn Sie bereits eine Datenbank haben, führen Sie `database-migration.sql` aus!

### Migration

1. Öffnen Sie Supabase SQL Editor
2. Führen Sie `database-migration.sql` aus
3. Optional: Verknüpfen Sie bestehende Kulturpflanzen mit EPPO Codes
