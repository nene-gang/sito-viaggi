-- Aggiunge il supporto per link (prenotazioni/biglietti) sulle attività
-- e per il collegamento automatico attività → voce di checklist.
ALTER TABLE attivita ADD COLUMN link TEXT;
ALTER TABLE checklist_voci ADD COLUMN attivita_id INTEGER;