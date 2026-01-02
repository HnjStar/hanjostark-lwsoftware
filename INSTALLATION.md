# Installationsanleitung

## Problem: PowerShell-Ausführungsrichtlinie

Wenn Sie den Fehler erhalten: "Die Ausführung von Skripts auf diesem System deaktiviert ist"

### Lösung 1: Temporär für diese Session (empfohlen)
Führen Sie in PowerShell aus:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

### Lösung 2: Permanente Lösung (nur wenn nötig)
Führen Sie in PowerShell als Administrator aus:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Problem: SSL-Fehler bei npm install

Wenn Sie einen SSL-Fehler erhalten, versuchen Sie folgende Lösungen:

### Lösung 1: Node.js aktualisieren
```powershell
# Prüfen Sie Ihre Node.js Version
node --version

# Falls nötig, aktualisieren Sie Node.js von https://nodejs.org/
```

### Lösung 2: npm Registry ändern
```powershell
npm config set registry http://registry.npmjs.org/
npm install --legacy-peer-deps
```

### Lösung 3: SSL-Prüfung temporär deaktivieren (nur für Installation)
```powershell
npm config set strict-ssl false
npm install --legacy-peer-deps
npm config set strict-ssl true
```

### Lösung 4: Alternative - Verwenden Sie yarn
```powershell
# Installieren Sie yarn (falls nicht vorhanden)
npm install -g yarn

# Dann im Projektverzeichnis:
yarn install
```

## Normale Installation (wenn keine Fehler auftreten)

1. Öffnen Sie PowerShell im Projektverzeichnis
2. Führen Sie aus:
```powershell
npm install
```

3. Starten Sie den Entwicklungsserver:
```powershell
npm run dev
```

## Datenbank einrichten

Vergessen Sie nicht, das Datenbank-Schema in Supabase einzurichten:

1. Öffnen Sie: https://bzshlphhsjwawuwikxxk.supabase.co
2. Gehen Sie zu "SQL Editor"
3. Kopieren Sie den Inhalt von `database-schema.sql`
4. Führen Sie das SQL-Script aus

## Hilfe

Falls die Installation weiterhin Probleme macht, können Sie auch versuchen:
- Node.js auf die neueste LTS-Version aktualisieren
- Antivirus-Software temporär deaktivieren
- Als Administrator ausführen
