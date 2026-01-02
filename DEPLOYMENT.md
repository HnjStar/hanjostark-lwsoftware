# Deployment-Anleitung - Kostenloses Hosting

Diese Anleitung zeigt Ihnen, wie Sie die Landwirtschaft Software kostenlos online hosten können.

## Option 1: Vercel (Empfohlen - Am einfachsten) ⭐

Vercel ist die einfachste und schnellste Option für React/Vite-Anwendungen.

### Schritt 1: GitHub Repository erstellen

1. Erstellen Sie ein GitHub-Konto (falls noch nicht vorhanden): https://github.com
2. Erstellen Sie ein neues Repository:
   - Gehen Sie zu https://github.com/new
   - Geben Sie einen Namen ein (z.B. "landwirtschaft-software")
   - Wählen Sie "Public" oder "Private"
   - Klicken Sie auf "Create repository"

### Schritt 2: Code zu GitHub hochladen

**Option A: Über GitHub Desktop (Einfachste Methode)**
1. Installieren Sie GitHub Desktop: https://desktop.github.com
2. Öffnen Sie GitHub Desktop
3. File → Add Local Repository
4. Wählen Sie Ihr Projektverzeichnis
5. Geben Sie eine Commit-Nachricht ein (z.B. "Initial commit")
6. Klicken Sie auf "Commit to main"
7. Klicken Sie auf "Publish repository"

**Option B: Über Git Command Line**
```powershell
# Im Projektverzeichnis ausführen:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/IHR-USERNAME/IHR-REPOSITORY.git
git push -u origin main
```

### Schritt 3: Auf Vercel deployen

1. Gehen Sie zu https://vercel.com
2. Klicken Sie auf "Sign Up" und melden Sie sich mit GitHub an
3. Klicken Sie auf "Add New Project"
4. Wählen Sie Ihr Repository aus
5. Vercel erkennt automatisch Vite - keine weiteren Einstellungen nötig!
6. Klicken Sie auf "Deploy"
7. Warten Sie 1-2 Minuten - fertig! 🎉

**Ihre Anwendung ist jetzt live unter:** `https://ihr-projekt-name.vercel.app`

### Schritt 4: Umgebungsvariablen (Optional)

Falls Sie später die Supabase-URL oder den API-Key ändern möchten, können Sie diese als Umgebungsvariablen in Vercel setzen:
- Gehen Sie zu Project Settings → Environment Variables
- Fügen Sie Variablen hinzu (aktuell sind sie im Code hardcodiert)

---

## Option 2: Netlify (Alternative)

Netlify ist ebenfalls sehr einfach und bietet ähnliche Features wie Vercel.

### Schritt 1-2: Wie bei Vercel - Code zu GitHub hochladen

### Schritt 3: Auf Netlify deployen

1. Gehen Sie zu https://netlify.com
2. Klicken Sie auf "Sign up" und melden Sie sich mit GitHub an
3. Klicken Sie auf "Add new site" → "Import an existing project"
4. Wählen Sie Ihr GitHub-Repository
5. Netlify erkennt automatisch die Einstellungen:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Klicken Sie auf "Deploy site"
7. Warten Sie 1-2 Minuten - fertig! 🎉

**Ihre Anwendung ist jetzt live unter:** `https://zufaelliger-name.netlify.app`

### Custom Domain (Optional)

Beide Plattformen erlauben es, eine eigene Domain zu verwenden:
- Vercel: Project Settings → Domains
- Netlify: Site Settings → Domain Management

---

## Option 3: Cloudflare Pages (Sehr schnell)

1. Gehen Sie zu https://pages.cloudflare.com
2. Melden Sie sich an und verbinden Sie Ihr GitHub-Repository
3. Build-Einstellungen:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Klicken Sie auf "Save and Deploy"

---

## Option 4: GitHub Pages (Kostenlos, aber mehr Setup)

### Schritt 1: Vite für GitHub Pages konfigurieren

Fügen Sie in `vite.config.ts` hinzu:
```typescript
export default defineConfig({
  base: '/landwirtschaft-software/', // Ihr Repository-Name
  plugins: [react()],
})
```

### Schritt 2: GitHub Actions Workflow erstellen

Erstellen Sie `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Schritt 3: GitHub Pages aktivieren

1. Gehen Sie zu Repository Settings → Pages
2. Source: GitHub Actions
3. Nach dem ersten Push wird die Seite automatisch deployed

---

## Wichtige Hinweise

### 1. Supabase URL und API Key

Die Supabase-Konfiguration ist aktuell im Code hardcodiert. Das ist für den Start in Ordnung, aber für Production sollten Sie:

- Die Supabase-URL und den API-Key als Umgebungsvariablen setzen
- Oder sicherstellen, dass der API-Key nur für Ihre Domain gültig ist

### 2. Datenbank einrichten

**WICHTIG:** Vergessen Sie nicht, das Datenbank-Schema in Supabase einzurichten:
1. Öffnen Sie: https://bzshlphhsjwawuwikxxk.supabase.co
2. Gehen Sie zu "SQL Editor"
3. Führen Sie das SQL-Script aus `database-schema.sql` aus

### 3. HTTPS

Alle genannten Plattformen bieten automatisch HTTPS (verschlüsselte Verbindung) - kostenlos!

### 4. Automatische Updates

Bei Vercel, Netlify und Cloudflare Pages:
- Jeder Push zu GitHub wird automatisch deployed
- Sie erhalten eine neue URL für jeden Deployment (Preview)
- Die Haupt-URL wird aktualisiert, wenn Sie zu `main` pushen

---

## Empfehlung

**Für Anfänger:** Vercel ⭐
- Am einfachsten zu bedienen
- Automatische Erkennung von Vite
- Sehr schnelle Deployment-Zeiten
- Kostenloser Plan ist sehr großzügig

**Für mehr Kontrolle:** Netlify
- Ähnlich einfach wie Vercel
- Mehr Konfigurationsoptionen
- Gute Dokumentation

**Für maximale Geschwindigkeit:** Cloudflare Pages
- Sehr schnell weltweit
- Gute Integration mit Cloudflare-Services

---

## Troubleshooting

### Problem: Seite zeigt 404 bei direkter URL-Eingabe
**Lösung:** Die `vercel.json` oder `netlify.toml` Datei sollte das Routing korrekt handhaben. Stellen Sie sicher, dass diese Dateien im Repository sind.

### Problem: Build schlägt fehl
**Lösung:** 
- Prüfen Sie die Build-Logs in der Hosting-Plattform
- Stellen Sie sicher, dass `npm run build` lokal funktioniert
- Prüfen Sie, ob alle Abhängigkeiten in `package.json` sind

### Problem: Supabase-Verbindung funktioniert nicht
**Lösung:**
- Prüfen Sie, ob die Supabase-URL und der API-Key korrekt sind
- Stellen Sie sicher, dass Row Level Security (RLS) in Supabase aktiviert ist
- Prüfen Sie die Browser-Konsole auf Fehler

---

## Nächste Schritte nach dem Deployment

1. ✅ Datenbank-Schema in Supabase einrichten
2. ✅ Erste Anmeldung testen
3. ✅ Einen Test-Eintrag erstellen
4. ✅ Excel-Export testen
5. ✅ Optional: Eigene Domain einrichten

Viel Erfolg! 🚀
