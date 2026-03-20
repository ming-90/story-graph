import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { EntityTypeBadge, StatusBadge, ConfidenceBar, toRelationTypeKo } from '../shared/Badges'

interface EntityDetailProps {
  entityId: string
  onOpenScenario?: (scenarioId: string) => void
}

export default function EntityDetail({ entityId, onOpenScenario }: EntityDetailProps) {
  const entities = useStore((s) => s.entities)
  const relations = useStore((s) => s.relations)
  const evidence = useStore((s) => s.evidence)
  const scenarios = useStore((s) => s.scenarios)
  const updateEntity = useStore((s) => s.updateEntity)
  const removeEntity = useStore((s) => s.removeEntity)
  const selectRelation = useStore((s) => s.selectRelation)

  const entity = entities.find((e) => e.id === entityId)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')

  if (!entity) return null

  const connectedRelations = relations.filter(
    (r) => r.from === entityId || r.to === entityId
  )
  const relatedEvidence = evidence.filter((ev) =>
    ev.entityRefs.includes(entityId)
  )
  const linkedScenarios = scenarios.filter((s) =>
    s.linkedEntityIds.includes(entityId)
  )

  const startEdit = () => {
    setEditName(entity.name)
    setEditing(true)
  }

  const saveEdit = async () => {
    await updateEntity(entityId, { name: editName })
    setEditing(false)
  }

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <EntityTypeBadge type={entity.type} />
          <div className="flex gap-1">
            <button onClick={startEdit} className="btn-ghost py-0.5 px-2 text-xs">
              편집
            </button>
            <button
              onClick={() => removeEntity(entityId)}
              className="btn-danger py-0.5 px-2 text-xs"
            >
              삭제
            </button>
          </div>
        </div>

        {editing ? (
          <div className="flex gap-1">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input text-sm flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit()
                if (e.key === 'Escape') setEditing(false)
              }}
            />
            <button onClick={saveEdit} className="btn-primary text-xs px-2">✓</button>
          </div>
        ) : (
          <h2 className="text-base font-bold text-graph-text">{entity.name}</h2>
        )}

        <p className="text-xs text-graph-muted font-mono">{entity.id}</p>
      </div>

      {/* Attributes */}
      <div>
        <p className="text-xs font-medium text-graph-muted mb-2">속성</p>
        {Object.keys(entity.attributes).length === 0 ? (
          <p className="text-xs text-graph-muted">속성 없음</p>
        ) : (
          <div className="space-y-1">
            {Object.entries(entity.attributes).map(([k, v]) => (
              <div key={k} className="flex items-start gap-2 text-xs">
                <span className="text-graph-muted w-20 shrink-0">{k}</span>
                <span className="text-graph-text">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Relations */}
      <div>
        <p className="text-xs font-medium text-graph-muted mb-2">
          관계 ({connectedRelations.length}개)
        </p>
        {connectedRelations.length === 0 ? (
          <p className="text-xs text-graph-muted">관계 없음</p>
        ) : (
          <div className="space-y-1.5">
            {connectedRelations.map((rel) => {
              const isSource = rel.from === entityId
              const otherId = isSource ? rel.to : rel.from
              const other = entities.find((e) => e.id === otherId)
              return (
                <button
                  key={rel.id}
                  onClick={() => selectRelation(rel.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-graph-border/30 hover:bg-graph-border text-xs text-left transition-colors"
                >
                  <span className="text-graph-muted">{isSource ? '→' : '←'}</span>
                  <span className="font-medium text-graph-accent">{toRelationTypeKo(rel.type)}</span>
                  <span className="text-graph-muted">
                    {isSource ? other?.name ?? otherId : other?.name ?? otherId}
                  </span>
                  <StatusBadge status={rel.status} />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Evidence */}
      {relatedEvidence.length > 0 && (
        <div>
          <p className="text-xs font-medium text-graph-muted mb-2">
            근거 ({relatedEvidence.length}개)
          </p>
          <div className="space-y-2">
            {relatedEvidence.map((ev) => (
              <div
                key={ev.id}
                className="p-2 rounded bg-graph-border/30 text-xs space-y-1"
              >
                <p className="text-graph-text line-clamp-3">{ev.text}</p>
                {ev.source && (
                  <p className="text-graph-muted">출처: {ev.source}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Scenarios */}
      <div>
        <p className="text-xs font-medium text-graph-muted mb-2">
          연결된 시나리오 ({linkedScenarios.length}개)
        </p>
        {linkedScenarios.length === 0 ? (
          <p className="text-xs text-graph-muted">연결된 시나리오 없음</p>
        ) : (
          <div className="space-y-1.5">
            {linkedScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onOpenScenario?.(scenario.id)}
                className="w-full flex items-start gap-2 px-2 py-2 rounded bg-graph-border/30 hover:bg-graph-border text-xs text-left transition-colors group"
              >
                <svg
                  className="w-3 h-3 mt-0.5 shrink-0 text-graph-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-graph-text truncate">{scenario.title}</p>
                  {scenario.content && (
                    <p className="text-graph-muted line-clamp-2 mt-0.5">{scenario.content}</p>
                  )}
                </div>
                <svg
                  className="w-3 h-3 shrink-0 text-graph-muted opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
