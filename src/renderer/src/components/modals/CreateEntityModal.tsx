import { useState } from 'react'
import { useStore } from '../../store/useStore'
import type { EntityType } from '../../../../shared/types'

const ENTITY_TYPES: EntityType[] = ['Character', 'Faction', 'Event', 'Item', 'Location', 'Concept']

const ENTITY_TYPE_KO: Record<EntityType, string> = {
  Character: '캐릭터',
  Faction: '세력',
  Event: '사건',
  Item: '아이템',
  Location: '장소',
  Concept: '개념',
  Evidence: '근거'
}

const DEFAULT_ATTRIBUTES: Record<EntityType, Record<string, string>> = {
  Character: { 역할: '', 상태: '활성' },
  Faction: { 성향: '', 규모: '' },
  Event: { 챕터: '', 결과: '' },
  Item: { 희귀도: '', 소유자: '' },
  Location: { 지역: '', 유형: '' },
  Concept: { 분야: '' },
  Evidence: {}
}

interface CreateEntityModalProps {
  onClose: () => void
}

export default function CreateEntityModal({ onClose }: CreateEntityModalProps) {
  const createEntity = useStore((s) => s.createEntity)
  const [name, setName] = useState('')
  const [type, setType] = useState<EntityType>('Character')
  const [attrs, setAttrs] = useState<Record<string, string>>({ ...DEFAULT_ATTRIBUTES['Character'] })
  const [loading, setLoading] = useState(false)

  const handleTypeChange = (t: EntityType) => {
    setType(t)
    setAttrs({ ...DEFAULT_ATTRIBUTES[t] })
  }

  const handleAttrChange = (key: string, value: string) => {
    setAttrs((prev) => ({ ...prev, [key]: value }))
  }

  const addAttr = () => {
    setAttrs((prev) => ({ ...prev, '': '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const filteredAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([k, v]) => k.trim() && v.trim())
      )
      await createEntity({ type, name: name.trim(), attributes: filteredAttrs })
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
          <h2 className="text-sm font-semibold text-graph-text">엔티티 생성</h2>
          <button onClick={onClose} className="text-graph-muted hover:text-graph-text">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label className="text-xs text-graph-muted mb-1.5 block">유형</label>
            <div className="flex flex-wrap gap-2">
              {ENTITY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    type === t
                      ? 'border-graph-accent bg-graph-accent/20 text-graph-accent'
                      : 'border-graph-border text-graph-muted hover:border-graph-accent/50'
                  }`}
                >
                  {ENTITY_TYPE_KO[t] ?? t}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-graph-muted mb-1.5 block">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'Character' ? '예: 카이' : type === 'Faction' ? '예: 그림자 길드' : '이름 입력...'}
              className="input"
              autoFocus
            />
          </div>

          {/* Attributes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-graph-muted">속성</label>
              <button
                type="button"
                onClick={addAttr}
                className="text-xs text-graph-accent hover:text-graph-accent-hover"
              >
                + 추가
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(attrs).map(([key, value], i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={key}
                    onChange={(e) => {
                      const newAttrs = Object.fromEntries(
                        Object.entries(attrs).map(([k, v], idx) =>
                          idx === i ? [e.target.value, v] : [k, v]
                        )
                      )
                      setAttrs(newAttrs)
                    }}
                    placeholder="키"
                    className="input w-28"
                  />
                  <input
                    value={value}
                    onChange={(e) => handleAttrChange(key, e.target.value)}
                    placeholder="값"
                    className="input flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              취소
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '생성 중...' : '엔티티 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
