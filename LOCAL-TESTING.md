# Lokales Testen der Anwendung

## Entwicklungsserver starten

Führen Sie in PowerShell aus:
```powershell
npm run dev
```

Der Server startet automatisch und die Anwendung ist erreichbar unter:
**http://localhost:5173**

Öffnen Sie diese URL in Ihrem Browser.

---

## Wichtige Voraussetzungen

### 1. Datenbank-Schema einrichten (WICHTIG!)

**Bevor Sie die Anwendung nutzen können, müssen Sie die Datenbank in Supabase einrichten:**

1. Öffnen Sie: https://bzshlphhsjwawuwikxxk.supabase.co
2. Gehen Sie zu **"SQL Editor"** (links im Menü)
3. Öffnen Sie die Datei `database-schema.sql` in Ihrem Projekt
4. Kopieren Sie den **gesamten Inhalt** der Datei
5. Fügen Sie ihn in den SQL Editor ein
6. Klicken Sie auf **"Run"** (oder drücken Sie F5)

**Ohne dieses Schema funktioniert die Anwendung nicht!**

---

## Test-Ablauf

### Schritt 1: Registrierung testen
1. Öffnen Sie http://localhost:5173
2. Sie sollten die Anmeldeseite sehen
3. Klicken Sie auf "Noch kein Konto? Hier registrieren"
4. Geben Sie eine E-Mail-Adresse und ein Passwort ein (mindestens 6 Zeichen)
5. Klicken Sie auf "Registrieren"
6. Sie sollten eine Erfolgsmeldung sehen

### Schritt 2: Anmeldung testen
1. Melden Sie sich mit Ihrer E-Mail und dem Passwort an
2. Sie sollten zum Dashboard weitergeleitet werden

### Schritt 3: Formular testen
1. Klicken Sie auf "Neuer Eintrag"
2. Füllen Sie das Formular aus:
   - **Art der Verwendung:** Wählen Sie eine Option (Standard: Agrarfläche)
   - **Pflanzenschutzmittel:** Klicken Sie auf "+" um ein neues hinzuzufügen
   - **Zulassungsnummer:** Wird automatisch ausgefüllt, wenn Sie ein Mittel wählen
   - **Anwendungsdatum:** Standard ist heute (kann geändert werden)
   - **Startzeitpunkt:** Standard ist jetzt (kann geändert werden)
   - **Aufwandsmenge:** Geben Sie einen Wert ein (z.B. 5) und wählen Sie eine Einheit
   - **Kulturpflanze:** Klicken Sie auf "+" um eine neue hinzuzufügen (z.B. "Raps")
   - **Fläche:** Klicken Sie auf "+" um eine neue Fläche hinzuzufügen
     - Alias: z.B. "Feld X"
     - FID: z.B. "12345"
     - GPS: z.B. "52.1234, 10.5678"
   - **EPPO Code:** Klicken Sie auf "+" um einen neuen Code hinzuzufügen
   - **BBCH Stadium:** Klicken Sie auf "+" um ein neues Stadium hinzuzufügen
   - **Name & Vorname:** Werden automatisch vorausgefüllt
3. Klicken Sie auf "Eintrag speichern"
4. Sie sollten eine Erfolgsmeldung sehen

### Schritt 4: Übersicht testen
1. Nach dem Speichern sollte der Eintrag in der Übersicht erscheinen
2. Sie sehen eine Kachel mit den wichtigsten Informationen
3. Klicken Sie auf das Export-Symbol (📥) in einer Kachel, um einen einzelnen Eintrag zu exportieren

### Schritt 5: Export testen
1. Klicken Sie auf "Alle exportieren (Excel)"
2. Eine Excel-Datei sollte heruntergeladen werden
3. Öffnen Sie die Datei und prüfen Sie, ob alle Daten korrekt sind

---

## Häufige Probleme und Lösungen

### Problem: "Fehler beim Laden der Einträge"
**Lösung:** Das Datenbank-Schema wurde noch nicht eingerichtet. Führen Sie die SQL-Datei in Supabase aus.

### Problem: "Fehler beim Speichern"
**Lösung:** 
- Prüfen Sie, ob alle Pflichtfelder ausgefüllt sind
- Prüfen Sie die Browser-Konsole (F12) auf Fehlermeldungen
- Stellen Sie sicher, dass das Datenbank-Schema korrekt eingerichtet ist

### Problem: "Authentifizierung fehlgeschlagen"
**Lösung:**
- Prüfen Sie, ob die Supabase-URL und der API-Key in `src/lib/supabase.ts` korrekt sind
- Stellen Sie sicher, dass Sie sich registriert haben

### Problem: Seite lädt nicht / Port bereits belegt
**Lösung:**
```powershell
# Stoppen Sie den Server (Strg+C) und starten Sie ihn neu
npm run dev
```

Falls Port 5173 belegt ist, können Sie einen anderen Port verwenden:
```powershell
npm run dev -- --port 3000
```

### Problem: Dropdown-Felder sind leer
**Lösung:** 
- Die Standardwerte (Agrarfläche, geschlossener Raum, Saatgut) sollten automatisch erscheinen
- Für andere Felder müssen Sie zuerst Einträge hinzufügen (mit dem "+" Button)

---

## Browser-Konsole prüfen

Um Fehler zu finden:
1. Öffnen Sie die Browser-Entwicklertools (F12)
2. Gehen Sie zum Tab "Console"
3. Prüfen Sie auf rote Fehlermeldungen

---

## Server stoppen

Um den Entwicklungsserver zu stoppen:
- Drücken Sie **Strg+C** in der PowerShell

---

## Production Build testen

Um zu testen, wie die Anwendung in Production aussehen wird:

```powershell
# Build erstellen
npm run build

# Production-Server starten
npm run preview
```

Die Anwendung ist dann unter http://localhost:4173 erreichbar.

---

## Nächste Schritte

Nachdem Sie alles lokal getestet haben:
1. ✅ Datenbank-Schema eingerichtet
2. ✅ Registrierung funktioniert
3. ✅ Einträge können erstellt werden
4. ✅ Export funktioniert

Dann können Sie die Anwendung online hosten (siehe `QUICK-START-DEPLOY.md`)
