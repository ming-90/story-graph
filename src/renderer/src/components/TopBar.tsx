import { useState } from 'react'
import { useStore } from '../store/useStore'

const ENTITY_TYPES = ['Character', 'Faction', 'Event', 'Item', 'Location', 'Concept']

const ENTITY_TYPE_KO: Record<string, string> = {
  Character: '캐릭터',
  Faction: '세력',
  Event: '사건',
  Item: '아이템',
  Location: '장소',
  Concept: '개념'
}

interface TopBarProps {
  onCreateEntity: () => void
  onCreateRelation: () => void
  onOpenScenario: () => void
  onOpenSettings: () => void
}

export default function TopBar({ onCreateEntity, onCreateRelation, onOpenScenario, onOpenSettings }: TopBarProps) {
  const [searchInput, setSearchInput] = useState('')
  const entityTypeFilter = useStore((s) => s.entityTypeFilter)
  const setEntityTypeFilter = useStore((s) => s.setEntityTypeFilter)
  const setSearchQuery = useStore((s) => s.setSearchQuery)
  const entities = useStore((s) => s.entities)
  const isLoading = useStore((s) => s.isLoading)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
    setSearchQuery(e.target.value)
  }

  const toggleTypeFilter = (type: string) => {
    if (entityTypeFilter.includes(type)) {
      setEntityTypeFilter(entityTypeFilter.filter((t) => t !== type))
    } else {
      setEntityTypeFilter([...entityTypeFilter, type])
    }
  }

  return (
    <header className="panel flex items-center gap-3 pr-4 h-12 shrink-0 border-b z-10" style={{ paddingLeft: '80px', WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* App title */}
      {/* 아래 모든 요소는 클릭 가능하도록 drag 영역에서 제외 */}
      <div className="flex items-center gap-3 flex-1 min-w-0" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="flex items-center gap-2 mr-2 shrink-0">
          <div className="w-6 h-6 rounded bg-graph-accent flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-graph-text">StoryGraph</span>
        </div>

        <div className="h-4 w-px bg-graph-border shrink-0" />

        {/* Global search */}
        <div className="relative shrink-0">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-graph-muted"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="엔티티 검색..."
            value={searchInput}
            onChange={handleSearch}
            className="input pl-8 w-48 h-7 text-xs"
          />
        </div>

        {/* Entity type filters */}
        <div className="flex items-center gap-1 flex-wrap">
          {ENTITY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleTypeFilter(type)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                entityTypeFilter.includes(type)
                  ? 'border-graph-accent bg-graph-accent/20 text-graph-accent'
                  : 'border-graph-border text-graph-muted hover:border-graph-accent/50'
              }`}
            >
              {ENTITY_TYPE_KO[type] ?? type}
            </button>
          ))}
          {entityTypeFilter.length > 0 && (
            <button
              onClick={() => setEntityTypeFilter([])}
              className="text-xs text-graph-muted hover:text-graph-text ml-1"
            >
              초기화
            </button>
          )}
        </div>

        <div className="flex-1" />

        {/* Stats */}
        <span className="text-xs text-graph-muted shrink-0">
          {isLoading ? '불러오는 중...' : `엔티티 ${entities.length}개`}
        </span>

        <div className="h-4 w-px bg-graph-border shrink-0" />

        {/* Actions */}
        <button
          onClick={onOpenScenario}
          className="btn-ghost text-xs h-7 shrink-0 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          시나리오
        </button>
        <button onClick={onCreateRelation} className="btn-ghost text-xs h-7 shrink-0">
          + 관계
        </button>
        <button onClick={onCreateEntity} className="btn-primary text-xs h-7 shrink-0">
          + 엔티티
        </button>

        <div className="h-4 w-px bg-graph-border shrink-0" />

        <button
          onClick={onOpenSettings}
          title="설정"
          className="btn-ghost h-7 w-7 shrink-0 flex items-center justify-center p-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
