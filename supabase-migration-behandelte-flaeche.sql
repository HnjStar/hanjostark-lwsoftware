-- Behandelte Fläche (Wert + Einheit), z. B. 1,1 ha oder 550 kg Saatgut
-- In Supabase SQL Editor ausführen

ALTER TABLE eintraege ADD COLUMN IF NOT EXISTS behandelte_flaeche_wert DECIMAL(14, 4);
ALTER TABLE eintraege ADD COLUMN IF NOT EXISTS behandelte_flaeche_einheit TEXT;
