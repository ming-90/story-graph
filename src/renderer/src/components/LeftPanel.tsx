import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { EntityType, RelationStatus } from '../../../shared/types'
import { EntityTypeBadge } from './shared/Badges'

const ENTITY_TYPES: EntityType[] = ['Character', 'Faction', 'Event', 'Item', 'Location', 'Concept']
const RELATION_STATUSES: RelationStatus[] = ['proposed', 'verified', 'rejected']

export default function LeftPanel() {
  const entities = useStore((s) => s.entities)
  const relations = useStore((s) => s.relations)
  const suggestions = useStore((s) => s.suggestions)
  const searchQuery = useStore((s) => s.searchQuery)
  const entityTypeFilter = useStore((s) => s.entityTypeFilter)
  const setEntityTypeFilter = useStore((s) => s.setEntityTypeFilter)
  const statusFilter = useStore((s) => s.statusFilter)
  const setStatusFilter = useStore((s) => s.setStatusFilter)
  const showStructuralEdges = useStore((s) => s.showStructuralEdges)
  const showSemanticRelations = useStore((s) => s.showSemanticRelations)
  const toggleStructuralEdges = useStore((s) => s.toggleStructuralEdges)
  const toggleSemanticRelations = useStore((s) => s.toggleSemanticRelations)
  const selectEntity = useStore((s) => s.selectEntity)

  const TAB_LABELS = { entities: '엔티티', filters: '필터', queue: '대기열' }

  const [tab, setTab] = useState<'entities' | 'filters' | 'queue'>('entities')

  const pendingCount = suggestions.filter((s) => s.status === 'pending').length

  const filteredEntities = entities.filter((e) => {
    const matchesSearch = searchQuery
      ? e.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesType =
      entityTypeFilter.length > 0 ? entityTypeFilter.includes(e.type) : true
    return matchesSearch && matchesType
  })

  const recentEntities = [...entities]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5)

  const toggleStatusFilter = (status: RelationStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status))
    } else {
      setStatusFilter([...statusFilter, status])
    }
  }

  return (
    <aside className="panel w-60 shrink-0 flex flex-col border-r overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-graph-border">
        {(['entities', 'filters', 'queue'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium transition-colors relative ${
              tab === t
                ? 'text-graph-accent'
                : 'text-graph-muted hover:text-graph-text'
            }`}
          >
            {t === 'queue' && pendingCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 text-[10px] bg-graph-accent rounded-full flex items-center justify-center text-white">
                {pendingCount}
              </span>
            )}
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'entities' && (
          <div>
            {/* Type counts */}
            <div className="p-3 border-b border-graph-border">
              <p className="text-xs text-graph-muted mb-2">유형별</p>
              <div className="space-y-1">
                {ENTITY_TYPES.map((type) => {
                  const count = entities.filter((e) => e.type === type).length
                  const active = entityTypeFilter.includes(type)
                  return (
                    <button
                      key={type}
                      onClick={() =>
                        active
                          ? setEntityTypeFilter(entityTypeFilter.filter((t) => t !== type))
                          : setEntityTypeFilter([...entityTypeFilter, type])
                      }
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                        active
                          ? 'bg-graph-accent/10 text-graph-accent'
                          : 'hover:bg-graph-border text-graph-text'
                      }`}
                    >
                      <EntityTypeBadge type={type} />
                      <span className="text-graph-muted">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Entity list */}
            <div className="p-3">
              <p className="text-xs text-graph-muted mb-2">
                엔티티 ({filteredEntities.length}개)
              </p>
              <div className="space-y-1">
                {filteredEntities.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => selectEntity(entity.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-graph-border transition-colors text-left"
                  >
                    <EntityTypeBadge type={entity.type} dot />
                    <span className="truncate text-graph-text">{entity.name}</span>
                  </button>
                ))}
                {filteredEntities.length === 0 && (
                  <p className="text-xs text-graph-muted text-center py-4">엔티티 없음</p>
                )}
              </div>
            </div>

            {/* Recent edits */}
            {recentEntities.length > 0 && (
              <div className="p-3 border-t border-graph-border">
                <p className="text-xs text-graph-muted mb-2">최근 편집</p>
                <div className="space-y-1">
                  {recentEntities.map((entity) => (
                    <button
                      key={entity.id}
                      onClick={() => selectEntity(entity.id)}
                      className="w-full flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-graph-border transition-colors text-left"
                    >
                      <EntityTypeBadge type={entity.type} dot />
                      <span className="truncate text-graph-muted">{entity.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'filters' && (
          <div className="p-3 space-y-4">
            {/* Edge visibility */}
            <div>
              <p className="text-xs text-graph-muted mb-2">엣지 유형</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSemanticRelations}
                    onChange={toggleSemanticRelations}
                    className="accent-graph-accent"
                  />
                  <span className="text-xs text-graph-text">의미 관계</span>
                  <span className="text-xs text-graph-muted ml-auto">{relations.length}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStructuralEdges}
                    onChange={toggleStructuralEdges}
                    className="accent-graph-accent"
                  />
                  <span className="text-xs text-graph-text">구조 엣지</span>
                </label>
              </div>
            </div>

            {/* Relation status filter */}
            <div>
              <p className="text-xs text-graph-muted mb-2">관계 상태</p>
              <div className="space-y-2">
                {RELATION_STATUSES.map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={() => toggleStatusFilter(status)}
                      className="accent-graph-accent"
                    />
                    <span className={`text-xs badge status-${status}`}>{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'queue' && (
          <div className="p-3">
            <p className="text-xs text-graph-muted mb-2">
              AI 제안 대기열 ({pendingCount}개)
            </p>
            {suggestions.filter((s) => s.status === 'pending').length === 0 ? (
              <p className="text-xs text-graph-muted text-center py-8">
                대기 중인 제안 없음
              </p>
            ) : (
              <div className="space-y-2">
                {suggestions
                  .filter((s) => s.status === 'pending')
                  .map((sug) => (
                    <div
                      key={sug.id}
                      className="p-2 rounded bg-graph-border/50 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-1">
                        <span className="badge status-pending">{sug.suggestionType}</span>
                      </div>
                      {sug.reasonSummary && (
                        <p className="text-graph-muted line-clamp-2">{sug.reasonSummary}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
