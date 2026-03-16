import { randomUUID } from 'crypto'
import type Database from 'better-sqlite3'
import type { Entity, CreateEntityInput, UpdateEntityInput } from '../../shared/types'

export function createEntityRepo(db: Database.Database) {
  const getAll = (): Entity[] => {
    const rows = db.prepare('SELECT * FROM entities ORDER BY created_at DESC').all() as any[]
    return rows.map(deserialize)
  }

  const getById = (id: string): Entity | null => {
    const row = db.prepare('SELECT * FROM entities WHERE id = ?').get(id) as any
    return row ? deserialize(row) : null
  }

  const getByType = (type: string): Entity[] => {
    const rows = db.prepare('SELECT * FROM entities WHERE type = ? ORDER BY name').all(type) as any[]
    return rows.map(deserialize)
  }

  const create = (input: CreateEntityInput): Entity => {
    const now = Date.now()
    const entity: Entity = {
      id: `${input.type.toUpperCase().slice(0, 4)}_${randomUUID().slice(0, 8).toUpperCase()}`,
      type: input.type,
      name: input.name,
      attributes: input.attributes ?? {},
      createdAt: now,
      updatedAt: now
    }
    db.prepare(
      'INSERT INTO entities (id, type, name, attributes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(entity.id, entity.type, entity.name, JSON.stringify(entity.attributes), entity.createdAt, entity.updatedAt)
    return entity
  }

  const update = (id: string, input: UpdateEntityInput): Entity | null => {
    const existing = getById(id)
    if (!existing) return null
    const updated = {
      ...existing,
      ...input,
      attributes: { ...existing.attributes, ...(input.attributes ?? {}) },
      updatedAt: Date.now()
    }
    db.prepare(
      'UPDATE entities SET name = ?, attributes = ?, updated_at = ? WHERE id = ?'
    ).run(updated.name, JSON.stringify(updated.attributes), updated.updatedAt, id)
    return updated
  }

  const remove = (id: string): boolean => {
    const result = db.prepare('DELETE FROM entities WHERE id = ?').run(id)
    return result.changes > 0
  }

  const search = (query: string): Entity[] => {
    const rows = db
      .prepare("SELECT * FROM entities WHERE name LIKE ? OR attributes LIKE ? ORDER BY name")
      .all(`%${query}%`, `%${query}%`) as any[]
    return rows.map(deserialize)
  }

  return { getAll, getById, getByType, create, update, remove, search }
}

function deserialize(row: any): Entity {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    attributes: JSON.parse(row.attributes ?? '{}'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}
