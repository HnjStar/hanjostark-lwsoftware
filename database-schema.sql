-- Datenbankschema für Landwirtschaft Software
-- Diese SQL-Datei muss in Supabase ausgeführt werden

-- Tabelle für Benutzer (erweitert)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  vorname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Verwendungsarten
CREATE TABLE IF NOT EXISTS verwendungsarten (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Pflanzenschutzmittel
CREATE TABLE IF NOT EXISTS pflanzenschutzmittel (
  id SERIAL PRIMARY KEY,
  mittel TEXT NOT NULL,
  zulassungsnummer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mittel, zulassungsnummer)
);

-- Tabelle für Kulturpflanzen
CREATE TABLE IF NOT EXISTS kulturpflanzen (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Flächen
CREATE TABLE IF NOT EXISTS flaechen (
  id SERIAL PRIMARY KEY,
  alias TEXT NOT NULL UNIQUE,
  fid TEXT,
  gps TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für EPPO Codes
CREATE TABLE IF NOT EXISTS eppo_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für BBCH Stadien
CREATE TABLE IF NOT EXISTS bbch_stadien (
  id SERIAL PRIMARY KEY,
  stadium TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Haupttabelle für Einträge
CREATE TABLE IF NOT EXISTS eintraege (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  art_der_verwendung TEXT NOT NULL,
  pflanzenschutzmittel TEXT NOT NULL,
  zulassungsnummer TEXT NOT NULL,
  anwendungsdatum DATE NOT NULL,
  startzeitpunkt TIME NOT NULL,
  aufwandsmenge_wert DECIMAL(10, 2) NOT NULL,
  aufwandsmenge_einheit TEXT NOT NULL,
  kulturpflanze TEXT NOT NULL,
  flaeche_alias TEXT NOT NULL,
  flaeche_fid TEXT,
  flaeche_gps TEXT,
  eppo_code TEXT NOT NULL,
  bbch_stadium TEXT NOT NULL,
  user_name TEXT,
  user_vorname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) aktivieren
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verwendungsarten ENABLE ROW LEVEL SECURITY;
ALTER TABLE pflanzenschutzmittel ENABLE ROW LEVEL SECURITY;
ALTER TABLE kulturpflanzen ENABLE ROW LEVEL SECURITY;
ALTER TABLE flaechen ENABLE ROW LEVEL SECURITY;
ALTER TABLE eppo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bbch_stadien ENABLE ROW LEVEL SECURITY;
ALTER TABLE eintraege ENABLE ROW LEVEL SECURITY;

-- RLS Policies für users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies für verwendungsarten (alle authentifizierten Benutzer können lesen/schreiben)
CREATE POLICY "Authenticated users can read verwendungsarten" ON verwendungsarten
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert verwendungsarten" ON verwendungsarten
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies für pflanzenschutzmittel
CREATE POLICY "Authenticated users can read pflanzenschutzmittel" ON pflanzenschutzmittel
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert pflanzenschutzmittel" ON pflanzenschutzmittel
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies für kulturpflanzen
CREATE POLICY "Authenticated users can read kulturpflanzen" ON kulturpflanzen
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert kulturpflanzen" ON kulturpflanzen
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies für flaechen
CREATE POLICY "Authenticated users can read flaechen" ON flaechen
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert flaechen" ON flaechen
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies für eppo_codes
CREATE POLICY "Authenticated users can read eppo_codes" ON eppo_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert eppo_codes" ON eppo_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies für bbch_stadien
CREATE POLICY "Authenticated users can read bbch_stadien" ON bbch_stadien
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert bbch_stadien" ON bbch_stadien
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies für eintraege
CREATE POLICY "Users can view own entries" ON eintraege
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON eintraege
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Standardwerte einfügen (optional)
INSERT INTO verwendungsarten (name) VALUES 
  ('Agrarfläche'),
  ('geschlossener Raum'),
  ('Saatgut')
ON CONFLICT (name) DO NOTHING;
