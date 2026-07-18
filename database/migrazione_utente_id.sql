-- Collega i viaggi e le voci Wandex esistenti a un utente.
-- wandex_voci va ricreata perché la chiave primaria cambia
-- (da categoria+chiave a utente_id+categoria+chiave), e SQLite
-- non permette di modificare una chiave primaria con ALTER TABLE.

ALTER TABLE viaggi ADD COLUMN utente_id INTEGER;

-- Assegna tutti i viaggi esistenti al primo utente registrato.
-- Se in futuro più persone avessero già fatto login prima di questa
-- migrazione, questo andrebbe rivisto: per ora presume che tu sia
-- l'unica utente esistente.
UPDATE viaggi SET utente_id = (SELECT id FROM utenti ORDER BY id LIMIT 1);

CREATE TABLE wandex_voci_nuova (
  utente_id INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  chiave    TEXT NOT NULL,
  PRIMARY KEY (utente_id, categoria, chiave)
);

INSERT INTO wandex_voci_nuova (utente_id, categoria, chiave)
SELECT (SELECT id FROM utenti ORDER BY id LIMIT 1), categoria, chiave FROM wandex_voci;

DROP TABLE wandex_voci;
ALTER TABLE wandex_voci_nuova RENAME TO wandex_voci;