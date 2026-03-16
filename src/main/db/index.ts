import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { initSchema } from './schema'
import { createEntityRepo } from './entities'
import { createRelationRepo, createStructuralEdgeRepo } from './relations'
import { createEvidenceRepo } from './evidence'
import { createSuggestionRepo } from './suggestions'
import { createScenarioRepo } from './scenarios'

let db: Database.Database

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = join(app.getPath('userData'), 'storygraph.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

export function createRepositories() {
  const database = getDatabase()
  return {
    entities: createEntityRepo(database),
    relations: createRelationRepo(database),
    structuralEdges: createStructuralEdgeRepo(database),
    evidence: createEvidenceRepo(database),
    suggestions: createSuggestionRepo(database),
    scenarios: createScenarioRepo(database)
  }
}
