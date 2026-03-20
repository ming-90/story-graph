import { useStore } from '../../store/useStore'
import { EntityTypeBadge, StatusBadge, ConfidenceBar, toRelationTypeKo, RELATION_TYPE_KO } from '../shared/Badges'
import type { RelationStatus } from '../../../../shared/types'

interface RelationDetailProps {
  relationId: string
}

export default function RelationDetail({ relationId }: RelationDetailProps) {
  const relations = useStore((s) => s.relations)
  const entities = useStore((s) => s.entities)
  const evidence = useStore((s) => s.evidence)
  const updateRelationStatus = useStore((s) => s.updateRelationStatus)
  const removeRelation = useStore((s) => s.removeRelation)
  const selectEntity = useStore((s) => s.selectEntity)

  const relation = relations.find((r) => r.id === relationId)
  if (!relation) return null

  const fromEntity = entities.find((e) => e.id === relation.from)
  const toEntity = entities.find((e) => e.id === relation.to)
  const supportingEvidence = evidence.filter((ev) =>
    relation.supportedBy.includes(ev.id)
  )

  const changeStatus = (status: RelationStatus) => {
    updateRelationStatus(relationId, status)
  }

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <StatusBadge status={relation.status} />
          <button
            onClick={() => removeRelation(relationId)}
            className="btn-danger py-0.5 px-2 text-xs"
          >
            삭제
          </button>
        </div>
        <h2 className="text-base font-bold text-graph-accent">
          {toRelationTypeKo(relation.type)}
          {RELATION_TYPE_KO[relation.type] && (
            <span className="ml-1.5 text-xs font-normal text-graph-muted font-mono">{relation.type}</span>
          )}
        </h2>
        <p className="text-xs text-graph-muted font-mono">{relation.id}</p>
      </div>

      {/* Entities */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-graph-muted">엔티티</p>
        <div className="space-y-1">
          {fromEntity && (
            <button
              onClick={() => selectEntity(fromEntity.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-graph-border/30 hover:bg-graph-border text-xs text-left"
            >
              <span className="text-graph-muted text-[10px]">출발</span>
              <EntityTypeBadge type={fromEntity.type} dot />
              <span className="text-graph-text">{fromEntity.name}</span>
            </button>
          )}
          <div className="flex justify-center text-graph-muted text-xs">↓</div>
          {toEntity && (
            <button
              onClick={() => selectEntity(toEntity.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-graph-border/30 hover:bg-graph-border text-xs text-left"
            >
              <span className="text-graph-muted text-[10px]">도착</span>
              <EntityTypeBadge type={toEntity.type} dot />
              <span className="text-graph-text">{toEntity.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confidence */}
      <div>
        <p className="text-xs font-medium text-graph-muted mb-1">신뢰도</p>
        <ConfidenceBar value={relation.confidence} />
      </div>

      {/* Validity */}
      {(relation.validFrom || relation.validTo) && (
        <div>
          <p className="text-xs font-medium text-graph-muted mb-1">유효 기간</p>
          <div className="flex items-center gap-2 text-xs text-graph-text">
            <span>{relation.validFrom ?? '—'}</span>
            <span className="text-graph-muted">→</span>
            <span>{relation.validTo ?? '현재'}</span>
          </div>
        </div>
      )}

      {/* Status actions */}
      <div>
        <p className="text-xs font-medium text-graph-muted mb-2">상태</p>
        <div className="flex gap-2">
          {(['proposed', 'verified', 'rejected'] as RelationStatus[]).map((s) => {
            const STATUS_KO = { proposed: '제안됨', verified: '검증됨', rejected: '거절됨' }
            return (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className={`flex-1 text-xs py-1 rounded transition-colors ${
                relation.status === s
                  ? 'bg-graph-accent text-white'
                  : 'bg-graph-border text-graph-muted hover:text-graph-text'
              }`}
            >
              {STATUS_KO[s]}
            </button>
          )})}
        </div>
      </div>

      {/* Evidence */}
      {supportingEvidence.length > 0 && (
        <div>
          <p className="text-xs font-medium text-graph-muted mb-2">
            뒷받침 근거 ({supportingEvidence.length}개)
          </p>
          <div className="space-y-2">
            {supportingEvidence.map((ev) => (
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
    </div>
  )
}
