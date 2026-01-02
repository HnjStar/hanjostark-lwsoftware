# Server manuell starten

## Methode 1: Über PowerShell (Empfohlen)

1. Öffnen Sie eine **neue PowerShell** im Projektverzeichnis
2. Führen Sie aus:
```powershell
npm run dev
```

Sie sollten eine Ausgabe sehen wie:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

3. Öffnen Sie dann http://localhost:5173 im Browser

## Methode 2: Über das Start-Script

Doppelklicken Sie auf `start-server.ps1` oder führen Sie aus:
```powershell
.\start-server.ps1
```

## Wichtig

- **Lassen Sie die PowerShell geöffnet**, während der Server läuft
- Der Server läuft, solange die PowerShell geöffnet ist
- Um den Server zu stoppen: Drücken Sie **Strg+C** in der PowerShell

## Falls Port 5173 bereits belegt ist

Falls Sie eine Fehlermeldung sehen, dass Port 5173 bereits verwendet wird:
```powershell
npm run dev -- --port 3000
```

Dann öffnen Sie http://localhost:3000
