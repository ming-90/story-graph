import type Database from 'better-sqlite3'

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS entities (
      id          TEXT PRIMARY KEY,
      type        TEXT NOT NULL,
      name        TEXT NOT NULL,
      attributes  TEXT DEFAULT '{}',
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS structural_edges (
      id          TEXT PRIMARY KEY,
      type        TEXT NOT NULL,
      from_entity TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      to_entity   TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      created_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS relations (
      id           TEXT PRIMARY KEY,
      type         TEXT NOT NULL,
      from_entity  TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      to_entity    TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      confidence   REAL DEFAULT 0,
      valid_from   TEXT,
      valid_to     TEXT,
      status       TEXT NOT NULL DEFAULT 'proposed',
      supported_by TEXT DEFAULT '[]',
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id           TEXT PRIMARY KEY,
      text         TEXT NOT NULL,
      source       TEXT,
      embedding_id TEXT,
      entity_refs  TEXT DEFAULT '[]',
      created_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id              TEXT PRIMARY KEY,
      suggestion_type TEXT NOT NULL,
      data            TEXT NOT NULL,
      evidence_refs   TEXT DEFAULT '[]',
      reason_summary  TEXT,
      status          TEXT NOT NULL DEFAULT 'pending',
      created_at      INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_relations_from   ON relations(from_entity);
    CREATE INDEX IF NOT EXISTS idx_relations_to     ON relations(to_entity);
    CREATE INDEX IF NOT EXISTS idx_relations_status ON relations(status);
    CREATE INDEX IF NOT EXISTS idx_entities_type    ON entities(type);
    CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

    CREATE TABLE IF NOT EXISTS scenarios (
      id                TEXT PRIMARY KEY,
      title             TEXT NOT NULL,
      content           TEXT NOT NULL DEFAULT '',
      linked_entity_ids TEXT DEFAULT '[]',
      created_at        INTEGER NOT NULL,
      updated_at        INTEGER NOT NULL
    );
  `)
}
