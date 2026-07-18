CREATE TABLE IF NOT EXISTS utenti (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id  TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL UNIQUE,
  nome       TEXT,
  avatar_url TEXT,
  creato_il  TEXT DEFAULT (datetime('now'))
);