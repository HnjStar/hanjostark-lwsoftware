# 🚀 Schnellstart: Online hosten (5 Minuten)

## Die einfachste Methode: Vercel

### Schritt 1: Code zu GitHub hochladen (2 Minuten)

1. Gehen Sie zu https://github.com und erstellen Sie ein Konto (falls noch nicht vorhanden)
2. Klicken Sie auf das "+" Symbol oben rechts → "New repository"
3. Geben Sie einen Namen ein (z.B. "landwirtschaft-software")
4. Klicken Sie auf "Create repository"

**Dann in PowerShell (im Projektverzeichnis):**
```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/IHR-USERNAME/IHR-REPOSITORY-NAME.git
git push -u origin main
```
*(Ersetzen Sie IHR-USERNAME und IHR-REPOSITORY-NAME mit Ihren Werten)*

### Schritt 2: Auf Vercel deployen (2 Minuten)

1. Gehen Sie zu https://vercel.com
2. Klicken Sie auf "Sign Up" → Wählen Sie "Continue with GitHub"
3. Erlauben Sie Vercel den Zugriff auf Ihre Repositories
4. Klicken Sie auf "Add New Project"
5. Wählen Sie Ihr Repository aus
6. **WICHTIG:** Lassen Sie alle Einstellungen wie sie sind (Vercel erkennt Vite automatisch!)
7. Klicken Sie auf "Deploy"
8. Warten Sie 1-2 Minuten

**Fertig! 🎉** Ihre Anwendung ist jetzt live!

### Schritt 3: Datenbank einrichten (1 Minute)

**WICHTIG:** Bevor Sie die Anwendung nutzen können:

1. Öffnen Sie: https://bzshlphhsjwawuwikxxk.supabase.co
2. Gehen Sie zu "SQL Editor" (links im Menü)
3. Öffnen Sie die Datei `database-schema.sql` in Ihrem Projekt
4. Kopieren Sie den gesamten Inhalt
5. Fügen Sie ihn in den SQL Editor ein
6. Klicken Sie auf "Run" (oder F5)

**Jetzt können Sie die Anwendung nutzen!**

---

## Ihre Live-URL

Nach dem Deployment erhalten Sie eine URL wie:
- `https://landwirtschaft-software.vercel.app`
- Oder eine ähnliche URL

Diese URL können Sie jetzt überall verwenden!

---

## Automatische Updates

Jedes Mal, wenn Sie Code zu GitHub pushen, wird Vercel automatisch:
- ✅ Den Code neu bauen
- ✅ Die Anwendung aktualisieren
- ✅ Eine Preview-URL erstellen (für Pull Requests)

---

## Hilfe benötigt?

Lesen Sie die ausführliche Anleitung in `DEPLOYMENT.md` für:
- Alternative Hosting-Optionen (Netlify, Cloudflare Pages)
- Erweiterte Konfiguration
- Troubleshooting

---

## Kosten

✅ **Komplett kostenlos!**
- Vercel Free Plan: Unbegrenzte Projekte
- Unbegrenzte Bandbreite
- Automatisches HTTPS
- Keine Kreditkarte nötig
