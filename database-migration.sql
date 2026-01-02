-- Migration: Kulturpflanzen mit EPPO Code verknüpfen
-- Führen Sie diese Datei in Supabase aus, wenn Sie bereits eine Datenbank haben

-- EPPO Code Spalte zu Kulturpflanzen hinzufügen
ALTER TABLE kulturpflanzen 
ADD COLUMN IF NOT EXISTS eppo_code TEXT;

-- Optional: Falls Sie bereits Kulturpflanzen haben, können Sie diese manuell verknüpfen:
-- UPDATE kulturpflanzen SET eppo_code = 'BRSNW' WHERE name = 'Raps';
-- UPDATE kulturpflanzen SET eppo_code = 'TRZAX' WHERE name = 'Weizen';
-- etc.

-- Hinweis: Die EPPO Codes müssen zuerst in der Tabelle eppo_codes existieren,
-- bevor Sie sie hier verwenden können.
