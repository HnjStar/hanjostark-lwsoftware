-- RLS: Benutzer dürfen eigene Einträge bearbeiten und löschen
-- In Supabase SQL Editor ausführen (einmalig)

DROP POLICY IF EXISTS "Users can update own entries" ON eintraege;
CREATE POLICY "Users can update own entries" ON eintraege
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON eintraege;
CREATE POLICY "Users can delete own entries" ON eintraege
  FOR DELETE USING (auth.uid() = user_id);
