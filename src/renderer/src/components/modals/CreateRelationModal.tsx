import { useState } from 'react'
import { useStore } from '../../store/useStore'
import type { RelationType } from '../../../../shared/types'
import { toRelationTypeKo } from '../shared/Badges'

const RELATION_TYPES: RelationType[] = [
  'ALLY_OF', 'ENEMY_OF', 'CAUSED_BY', 'CONTRACT_WITH',
  'KNOWS', 'MEMBER_OF', 'OWNS', 'LEADS'
]

interface CreateRelationModalProps {
  onClose: () => void
  initialFromId?: string
  initialToId?: string
}

export default function CreateRelationModal({ onClose, initialFromId, initialToId }: CreateRelationModalProps) {
  const entities = useStore((s) => s.entities)
  const createRelation = useStore((s) => s.createRelation)

  const [fromId, setFromId] = useState(initialFromId ?? '')
  const [toId, setToId] = useState(initialToId ?? '')
  const [relType, setRelType] = useState<RelationType>('ALLY_OF')
  const [customType, setCustomType] = useState('')
  const [confidence, setConfidence] = useState(0.5)
  const [validFrom, setValidFrom] = useState('')
  const [loading, setLoading] = useState(false)

  const finalType = relType === 'CUSTOM' ? customType : relType

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromId || !toId || !finalType.trim()) return
    setLoading(true)
    try {
      await createRelation({
        type: finalType.trim(),
        from: fromId,
        to: toId,
        confidence,
        validFrom: validFrom || undefined,
        status: 'proposed'
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="panel rounded-xl w-[480px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-graph-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-graph-text">관계 생성</h2>
          <button onClick={onClose} className="text-graph-muted hover:text-graph-text">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* From → To */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-graph-muted mb-1.5 block">출발 *</label>
              <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="input">
                <option value="">엔티티 선택...</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    [{e.type}] {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-graph-muted mt-5">→</div>
            <div className="flex-1">
              <label className="text-xs text-graph-muted mb-1.5 block">도착 *</label>
              <select value={toId} onChange={(e) => setToId(e.target.value)} className="input">
                <option value="">엔티티 선택...</option>
                {entities
                  .filter((e) => e.id !== fromId)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.type}] {e.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Relation Type */}
          <div>
            <label className="text-xs text-graph-muted mb-1.5 block">관계 유형 *</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {RELATION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRelType(t)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    relType === t
                      ? 'border-graph-accent bg-graph-accent/20 text-graph-accent'
                      : 'border-graph-border text-graph-muted hover:border-graph-accent/50'
                  }`}
                >
                  {toRelationTypeKo(t)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRelType('CUSTOM' as any)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  relType === 'CUSTOM' as any
                    ? 'border-graph-accent bg-graph-accent/20 text-graph-accent'
                    : 'border-graph-border text-graph-muted hover:border-graph-accent/50'
                }`}
              >
                직접 입력
              </button>
            </div>
            {relType === 'CUSTOM' as any && (
              <input
                value={customType}
                onChange={(e) => setCustomType(e.target.value.toUpperCase())}
                placeholder="e.g. BETRAYED_BY"
                className="input"
              />
            )}
          </div>

          {/* Confidence */}
          <div>
            <label className="text-xs text-graph-muted mb-1.5 flex items-center justify-between">
              <span>신뢰도</span>
              <span className="text-graph-text">{Math.round(confidence * 100)}%</span>
            </label>
            <input
              type="range"
              min={0} max={1} step={0.01}
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full accent-graph-accent"
            />
          </div>

          {/* Valid From */}
          <div>
            <label className="text-xs text-graph-muted mb-1.5 block">시작 시점 (선택)</label>
            <input
              type="text"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              placeholder="예: 2챕터"
              className="input"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              취소
            </button>
            <button
              type="submit"
              disabled={!fromId || !toId || !finalType.trim() || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '생성 중...' : '관계 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
