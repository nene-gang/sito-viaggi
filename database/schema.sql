CREATE TABLE IF NOT EXISTS viaggi (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  titolo      TEXT NOT NULL,
  stato       TEXT NOT NULL,
  data_inizio TEXT,
  data_fine   TEXT,
  descrizione TEXT,
  note        TEXT
);

CREATE TABLE IF NOT EXISTS tappe (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  viaggio_id          INTEGER NOT NULL,
  nome                TEXT NOT NULL,
  paese               TEXT,
  paese_iso           TEXT,
  lat                 REAL,
  lng                 REAL,
  ordine              INTEGER,
  notti               INTEGER,
  data_arrivo         TEXT,
  data_partenza       TEXT,
  hotel               TEXT,
  stazione            TEXT,
  note                TEXT,
  trasporto_arrivo    TEXT,
  trasporto_partenza  TEXT,
  FOREIGN KEY (viaggio_id) REFERENCES viaggi(id)
);

CREATE TABLE IF NOT EXISTS giorni (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  tappa_id INTEGER NOT NULL,
  numero   INTEGER,
  titolo   TEXT,
  data     TEXT,
  FOREIGN KEY (tappa_id) REFERENCES tappe(id)
);

CREATE TABLE IF NOT EXISTS attivita (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  giorno_id INTEGER NOT NULL,
  ora      TEXT,
  nome     TEXT,
  note     TEXT,
  tipo     TEXT,
  lat      REAL,
  lng      REAL,
  FOREIGN KEY (giorno_id) REFERENCES giorni(id)
);

CREATE TABLE IF NOT EXISTS checklist_voci (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  viaggio_id INTEGER NOT NULL,
  testo      TEXT NOT NULL,
  completata INTEGER DEFAULT 0,
  ordine     INTEGER DEFAULT 0,
  FOREIGN KEY (viaggio_id) REFERENCES viaggi(id)
);

CREATE TABLE IF NOT EXISTS wandex_voci (
  categoria TEXT NOT NULL,
  chiave    TEXT NOT NULL,
  PRIMARY KEY (categoria, chiave)
);