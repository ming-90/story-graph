import { randomUUID } from 'crypto'
import type Database from 'better-sqlite3'
import type { Scenario, CreateScenarioInput, UpdateScenarioInput } from '../../shared/types'

export function createScenarioRepo(db: Database.Database) {
  const getAll = (): Scenario[] => {
    const rows = db.prepare('SELECT * FROM scenarios ORDER BY updated_at DESC').all() as any[]
    return rows.map(deserialize)
  }

  const getById = (id: string): Scenario | null => {
    const row = db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id) as any
    return row ? deserialize(row) : null
  }

  const create = (input: CreateScenarioInput): Scenario => {
    const now = Date.now()
    const scenario: Scenario = {
      id: `SCN_${randomUUID().slice(0, 8).toUpperCase()}`,
      title: input.title,
      content: input.content,
      linkedEntityIds: [],
      createdAt: now,
      updatedAt: now
    }
    db.prepare(
      `INSERT INTO scenarios (id, title, content, linked_entity_ids, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(scenario.id, scenario.title, scenario.content, '[]', scenario.createdAt, scenario.updatedAt)
    return scenario
  }

  const update = (id: string, input: UpdateScenarioInput): Scenario | null => {
    const existing = getById(id)
    if (!existing) return null
    const updated: Scenario = {
      ...existing,
      title: input.title ?? existing.title,
      content: input.content ?? existing.content,
      linkedEntityIds: input.linkedEntityIds ?? existing.linkedEntityIds,
      updatedAt: Date.now()
    }
    db.prepare(
      `UPDATE scenarios SET title = ?, content = ?, linked_entity_ids = ?, updated_at = ? WHERE id = ?`
    ).run(updated.title, updated.content, JSON.stringify(updated.linkedEntityIds), updated.updatedAt, id)
    return updated
  }

  const remove = (id: string): boolean => {
    const result = db.prepare('DELETE FROM scenarios WHERE id = ?').run(id)
    return result.changes > 0
  }

  return { getAll, getById, create, update, remove }
}

function deserialize(row: any): Scenario {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    linkedEntityIds: JSON.parse(row.linked_entity_ids ?? '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}
