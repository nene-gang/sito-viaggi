-- Rende possibile l'accesso nativo (email + password) accanto al login Google.
-- google_id non può più essere obbligatorio: un utente registrato con
-- email/password non ce l'ha. SQLite non permette di togliere un vincolo
-- NOT NULL con ALTER TABLE, quindi la tabella va ricreata — preservando
-- gli id esistenti, dato che viaggi/wandex_voci/amicizie li referenziano.

CREATE TABLE utenti_nuova (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id     TEXT UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  nome          TEXT,
  avatar_url    TEXT,
  password_hash TEXT,
  password_salt TEXT,
  creato_il     TEXT DEFAULT (datetime('now'))
);

INSERT INTO utenti_nuova (id, google_id, email, nome, avatar_url, creato_il)
SELECT id, google_id, email, nome, avatar_url, creato_il FROM utenti;

DROP TABLE utenti;
ALTER TABLE utenti_nuova RENAME TO utenti;

-- Attenzione allo "sqlite_sequence": dopo il rename, il contatore
-- dell'AUTOINCREMENT resterebbe associato al nome vecchio "utenti_nuova"
-- e il prossimo utente registrato rischierebbe di ricevere un id già
-- usato. Lo si corregge esplicitamente qui.
UPDATE sqlite_sequence SET name = 'utenti' WHERE name = 'utenti_nuova';