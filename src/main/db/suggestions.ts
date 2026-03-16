import { randomUUID } from 'crypto'
import type Database from 'better-sqlite3'
import type { AISuggestion, CreateSuggestionInput } from '../../shared/types'

export function createSuggestionRepo(db: Database.Database) {
  const getAll = (): AISuggestion[] => {
    const rows = db
      .prepare("SELECT * FROM suggestions ORDER BY created_at DESC")
      .all() as any[]
    return rows.map(deserialize)
  }

  const getPending = (): AISuggestion[] => {
    const rows = db
      .prepare("SELECT * FROM suggestions WHERE status = 'pending' ORDER BY created_at DESC")
      .all() as any[]
    return rows.map(deserialize)
  }

  const create = (input: CreateSuggestionInput): AISuggestion => {
    const suggestion: AISuggestion = {
      id: `SUG_${randomUUID().slice(0, 8).toUpperCase()}`,
      suggestionType: input.suggestionType,
      data: input.data,
      evidenceRefs: input.evidenceRefs ?? [],
      reasonSummary: input.reasonSummary,
      status: 'pending',
      createdAt: Date.now()
    }
    db.prepare(
      `INSERT INTO suggestions (id, suggestion_type, data, evidence_refs, reason_summary, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      suggestion.id, suggestion.suggestionType, JSON.stringify(suggestion.data),
      JSON.stringify(suggestion.evidenceRefs), suggestion.reasonSummary ?? null,
      suggestion.status, suggestion.createdAt
    )
    return suggestion
  }

  const updateStatus = (id: string, status: AISuggestion['status']): boolean => {
    const result = db
      .prepare('UPDATE suggestions SET status = ? WHERE id = ?')
      .run(status, id)
    return result.changes > 0
  }

  const remove = (id: string): boolean => {
    const result = db.prepare('DELETE FROM suggestions WHERE id = ?').run(id)
    return result.changes > 0
  }

  return { getAll, getPending, create, updateStatus, remove }
}

function deserialize(row: any): AISuggestion {
  return {
    id: row.id,
    suggestionType: row.suggestion_type,
    data: JSON.parse(row.data),
    evidenceRefs: JSON.parse(row.evidence_refs ?? '[]'),
    reasonSummary: row.reason_summary ?? undefined,
    status: row.status,
    createdAt: row.created_at
  }
}
