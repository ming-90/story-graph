import { randomUUID } from 'crypto'
import type Database from 'better-sqlite3'
import type { Evidence, CreateEvidenceInput } from '../../shared/types'

export function createEvidenceRepo(db: Database.Database) {
  const getAll = (): Evidence[] => {
    const rows = db.prepare('SELECT * FROM evidence ORDER BY created_at DESC').all() as any[]
    return rows.map(deserialize)
  }

  const getById = (id: string): Evidence | null => {
    const row = db.prepare('SELECT * FROM evidence WHERE id = ?').get(id) as any
    return row ? deserialize(row) : null
  }

  const getByEntityRef = (entityId: string): Evidence[] => {
    const rows = db
      .prepare("SELECT * FROM evidence WHERE entity_refs LIKE ?")
      .all(`%${entityId}%`) as any[]
    return rows.map(deserialize)
  }

  const create = (input: CreateEvidenceInput): Evidence => {
    const evidence: Evidence = {
      id: `EV_${randomUUID().slice(0, 8).toUpperCase()}`,
      text: input.text,
      source: input.source,
      embeddingId: input.embeddingId,
      entityRefs: input.entityRefs ?? [],
      createdAt: Date.now()
    }
    db.prepare(
      'INSERT INTO evidence (id, text, source, embedding_id, entity_refs, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      evidence.id, evidence.text, evidence.source ?? null,
      evidence.embeddingId ?? null, JSON.stringify(evidence.entityRefs), evidence.createdAt
    )
    return evidence
  }

  const remove = (id: string): boolean => {
    const result = db.prepare('DELETE FROM evidence WHERE id = ?').run(id)
    return result.changes > 0
  }

  return { getAll, getById, getByEntityRef, create, remove }
}

function deserialize(row: any): Evidence {
  return {
    id: row.id,
    text: row.text,
    source: row.source ?? undefined,
    embeddingId: row.embedding_id ?? undefined,
    entityRefs: JSON.parse(row.entity_refs ?? '[]'),
    createdAt: row.created_at
  }
}
