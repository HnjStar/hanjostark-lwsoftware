-- Migration: Aktiv/Inaktiv für Stammdatenlisten
-- WICHTIG: Zuerst im Supabase SQL Editor ausführen: https://bzshlphhsjwawuwikxxk.supabase.co
-- Danach funktionieren die Listen mit Aktiv/Inaktiv-Umschalter.

-- Spalte 'aktiv' hinzufügen (Standard: true für bestehende Einträge)
ALTER TABLE verwendungsarten ADD COLUMN IF NOT EXISTS aktiv BOOLEAN DEFAULT true;
ALTER TABLE pflanzenschutzmittel ADD COLUMN IF NOT EXISTS aktiv BOOLEAN DEFAULT true;
ALTER TABLE kulturpflanzen ADD COLUMN IF NOT EXISTS aktiv BOOLEAN DEFAULT true;
ALTER TABLE flaechen ADD COLUMN IF NOT EXISTS aktiv BOOLEAN DEFAULT true;
ALTER TABLE bbch_stadien ADD COLUMN IF NOT EXISTS aktiv BOOLEAN DEFAULT true;

-- Bestehende Einträge auf aktiv setzen (falls Spalte neu)
UPDATE verwendungsarten SET aktiv = true WHERE aktiv IS NULL;
UPDATE pflanzenschutzmittel SET aktiv = true WHERE aktiv IS NULL;
UPDATE kulturpflanzen SET aktiv = true WHERE aktiv IS NULL;
UPDATE flaechen SET aktiv = true WHERE aktiv IS NULL;
UPDATE bbch_stadien SET aktiv = true WHERE aktiv IS NULL;

-- UPDATE Policies für Toggle aktiv/inaktiv
-- (Falls Fehler "policy already exists": Policy ist bereits vorhanden, ignorieren.)
DROP POLICY IF EXISTS "Authenticated users can update verwendungsarten" ON verwendungsarten;
CREATE POLICY "Authenticated users can update verwendungsarten" ON verwendungsarten
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update pflanzenschutzmittel" ON pflanzenschutzmittel;
CREATE POLICY "Authenticated users can update pflanzenschutzmittel" ON pflanzenschutzmittel
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update kulturpflanzen" ON kulturpflanzen;
CREATE POLICY "Authenticated users can update kulturpflanzen" ON kulturpflanzen
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update flaechen" ON flaechen;
CREATE POLICY "Authenticated users can update flaechen" ON flaechen
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update bbch_stadien" ON bbch_stadien;
CREATE POLICY "Authenticated users can update bbch_stadien" ON bbch_stadien
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
