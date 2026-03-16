import { randomUUID } from 'crypto'
import type Database from 'better-sqlite3'
import type {
  Relation,
  StructuralEdge,
  CreateRelationInput,
  UpdateRelationInput,
  CreateStructuralEdgeInput
} from '../../shared/types'

export function createRelationRepo(db: Database.Database) {
  const getAll = (): Relation[] => {
    const rows = db.prepare('SELECT * FROM relations ORDER BY created_at DESC').all() as any[]
    return rows.map(deserializeRelation)
  }

  const getByEntity = (entityId: string): Relation[] => {
    const rows = db
      .prepare('SELECT * FROM relations WHERE from_entity = ? OR to_entity = ?')
      .all(entityId, entityId) as any[]
    return rows.map(deserializeRelation)
  }

  const create = (input: CreateRelationInput): Relation => {
    const now = Date.now()
    const relation: Relation = {
      id: `REL_${randomUUID().slice(0, 8).toUpperCase()}`,
      type: input.type,
      from: input.from,
      to: input.to,
      confidence: input.confidence ?? 0,
      validFrom: input.validFrom,
      validTo: input.validTo,
      status: input.status ?? 'proposed',
      supportedBy: input.supportedBy ?? [],
      createdAt: now,
      updatedAt: now
    }
    db.prepare(
      `INSERT INTO relations
        (id, type, from_entity, to_entity, confidence, valid_from, valid_to, status, supported_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      relation.id, relation.type, relation.from, relation.to,
      relation.confidence, relation.validFrom ?? null, relation.validTo ?? null,
      relation.status, JSON.stringify(relation.supportedBy),
      relation.createdAt, relation.updatedAt
    )
    return relation
  }

  const update = (id: string, input: UpdateRelationInput): Relation | null => {
    const rows = db.prepare('SELECT * FROM relations WHERE id = ?').all(id) as any[]
    if (!rows.length) return null
    const existing = deserializeRelation(rows[0])
    const updated = { ...existing, ...input, updatedAt: Date.now() }
    db.prepare(
      `UPDATE relations SET type = ?, confidence = ?, valid_from = ?, valid_to = ?,
       status = ?, supported_by = ?, updated_at = ? WHERE id = ?`
    ).run(
      updated.type, updated.confidence, updated.validFrom ?? null, updated.validTo ?? null,
      updated.status, JSON.stringify(updated.supportedBy), updated.updatedAt, id
    )
    return updated
  }

  const updateStatus = (id: string, status: Relation['status']): boolean => {
    const result = db
      .prepare('UPDATE relations SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, Date.now(), id)
    return result.changes > 0
  }

  const remove = (id: string): boolean => {
    const result = db.prepare('DELETE FROM relations WHERE id = ?').run(id)
    return result.changes > 0
  }

  return { getAll, getByEntity, create, update, updateStatus, remove }
}

export function createStructuralEdgeRepo(db: Database.Database) {
  const getAll = (): StructuralEdge[] => {
    const rows = db.prepare('SELECT * FROM structural_edges ORDER BY created_at DESC').all() as any[]
    return rows.map(deserializeEdge)
  }

  const getByEntity = (entityId: string): StructuralEdge[] => {
    const rows = db
      .prepare('SELECT * FROM structural_edges WHERE from_entity = ? OR to_entity = ?')
      .all(entityId, entityId) as any[]
    return rows.map(deserializeEdge)
  }

  const create = (input: CreateStructuralEdgeInput): StructuralEdge => {
    const edge: StructuralEdge = {
      id: `SEDGE_${randomUUID().slice(0, 8).toUpperCase()}`,
      type: input.type,
      from: input.from,
      to: input.to,
      createdAt: Date.now()
    }
    db.prepare(
      'INSERT INTO structural_edges (id, type, from_entity, to_entity, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(edge.id, edge.type, edge.from, edge.to, edge.createdAt)
    return edge
  }

  const remove = (id: string): boolean => {
    const result = db.prepare('DELETE FROM structural_edges WHERE id = ?').run(id)
    return result.changes > 0
  }

  return { getAll, getByEntity, create, remove }
}

function deserializeRelation(row: any): Relation {
  return {
    id: row.id,
    type: row.type,
    from: row.from_entity,
    to: row.to_entity,
    confidence: row.confidence,
    validFrom: row.valid_from ?? undefined,
    validTo: row.valid_to ?? undefined,
    status: row.status,
    supportedBy: JSON.parse(row.supported_by ?? '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function deserializeEdge(row: any): StructuralEdge {
  return {
    id: row.id,
    type: row.type,
    from: row.from_entity,
    to: row.to_entity,
    createdAt: row.created_at
  }
}
