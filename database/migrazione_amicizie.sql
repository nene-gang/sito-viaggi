-- Amicizie tra utenti: richiesta → accettazione, alla base delle Sfide
-- (i partecipanti a una sfida si scelgono tra i propri amici).
CREATE TABLE IF NOT EXISTS amicizie (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  richiedente_id  INTEGER NOT NULL,
  destinatario_id INTEGER NOT NULL,
  stato           TEXT NOT NULL DEFAULT 'in_attesa', -- 'in_attesa' | 'accettata'
  creata_il       TEXT DEFAULT (datetime('now')),
  UNIQUE(richiedente_id, destinatario_id),
  FOREIGN KEY (richiedente_id) REFERENCES utenti(id),
  FOREIGN KEY (destinatario_id) REFERENCES utenti(id)
);