import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import type { Scenario, EntityType } from '../../../shared/types'
import { EntityTypeBadge } from './shared/Badges'

const ENTITY_TYPE_KO: Record<EntityType, string> = {
  Character: '캐릭터',
  Faction: '세력',
  Event: '사건',
  Item: '아이템',
  Location: '장소',
  Concept: '개념',
  Evidence: '근거'
}

interface ScenarioPanelProps {
  onClose: () => void
  initialScenarioId?: string
}

export default function ScenarioPanel({ onClose, initialScenarioId }: ScenarioPanelProps) {
  const scenarios = useStore((s) => s.scenarios)
  const entities = useStore((s) => s.entities)
  const createScenario = useStore((s) => s.createScenario)
  const updateScenario = useStore((s) => s.updateScenario)
  const removeScenario = useStore((s) => s.removeScenario)
  const createEntity = useStore((s) => s.createEntity)
  const createEvidence = useStore((s) => s.createEvidence)
  const linkEntityToScenario = useStore((s) => s.linkEntityToScenario)
  const unlinkEntityFromScenario = useStore((s) => s.unlinkEntityFromScenario)
  const selectEntity = useStore((s) => s.selectEntity)

  const [selectedId, setSelectedId] = useState<string | null>(
    initialScenarioId ?? scenarios[0]?.id ?? null
  )
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)
  const [createError, setCreateError] = useState('')
  const [linkEntityType, setLinkEntityType] = useState<EntityType>('Event')
  const [linkEntityName, setLinkEntityName] = useState('')
  const [addingEntity, setAddingEntity] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const selected = scenarios.find((s) => s.id === selectedId) ?? null
  const deleteTarget = deleteConfirmId
    ? scenarios.find((s) => s.id === deleteConfirmId) ?? null
    : null

  useEffect(() => {
    if (selected) {
      setEditTitle(selected.title)
      setEditContent(selected.content)
      setIsDirty(false)
    }
  }, [selectedId, selected?.id])

  const handleSave = async () => {
    if (!selected || !isDirty) return
    setSaving(true)
    await updateScenario(selected.id, { title: editTitle, content: editContent })
    setIsDirty(false)
    setSaving(false)
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreateError('')
    try {
      const scenario = await createScenario({ title: newTitle.trim(), content: '' })
      setSelectedId(scenario.id)
      setNewTitle('')
      setCreatingNew(false)
    } catch (e: any) {
      console.error('[ScenarioPanel] 시나리오 생성 실패:', e)
      setCreateError(e?.message ?? '생성에 실패했습니다')
    }
  }

  const handleRemove = async (id: string) => {
    await removeScenario(id)
    setDeleteConfirmId(null)
    if (selectedId === id) {
      const remaining = scenarios.filter((s) => s.id !== id)
      setSelectedId(remaining[0]?.id ?? null)
    }
  }

  const handleCreateEntityFromScenario = async () => {
    if (!selected || !linkEntityName.trim()) return
    setAddingEntity(true)
    try {
      const entity = await createEntity({
        type: linkEntityType,
        name: linkEntityName.trim(),
        attributes:
          linkEntityType === 'Event'
            ? { 챕터: '', 결과: '', 출처: selected.title }
            : { 출처: selected.title }
      })

      if (selected.content.trim()) {
        await createEvidence({
          text: selected.content,
          source: selected.title,
          entityRefs: [entity.id]
        })
      }

      await linkEntityToScenario(selected.id, entity.id)
      setLinkEntityName('')
    } catch (e: any) {
      console.error('[ScenarioPanel] 엔티티 생성 실패:', e)
      alert(`엔티티 생성 실패: ${e?.message ?? '알 수 없는 오류'}`)
    } finally {
      setAddingEntity(false)
    }
  }

  const linkedEntities = selected
    ? entities.filter((e) => selected.linkedEntityIds.includes(e.id))
    : []

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-stretch justify-end" onClick={onClose}>
      <div
        className="panel w-[820px] flex flex-col h-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-graph-border shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-graph-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-sm font-semibold text-graph-text">시나리오</h2>
            <span className="text-xs text-graph-muted">{scenarios.length}개</span>
          </div>
          <button onClick={onClose} className="text-graph-muted hover:text-graph-text transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── 왼쪽: 시나리오 목록 ── */}
          <div className="w-52 shrink-0 border-r border-graph-border flex flex-col">
            <div className="p-3 border-b border-graph-border">
              {creatingNew ? (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <input
                      value={newTitle}
                      onChange={(e) => { setNewTitle(e.target.value); setCreateError('') }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreate()
                        if (e.key === 'Escape') { setCreatingNew(false); setCreateError('') }
                      }}
                      placeholder="시나리오 제목"
                      className="input text-xs flex-1"
                      autoFocus
                    />
                    <button onClick={handleCreate} className="btn-primary text-xs px-2">✓</button>
                    <button
                      onClick={() => { setCreatingNew(false); setCreateError('') }}
                      className="btn-ghost text-xs px-2"
                    >✕</button>
                  </div>
                  {createError && (
                    <p className="text-[10px] text-red-400 px-1">{createError}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setCreatingNew(true)}
                  className="w-full btn-ghost text-xs justify-start flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  새 시나리오
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-1">
              {scenarios.length === 0 ? (
                <p className="text-xs text-graph-muted text-center py-6">시나리오 없음</p>
              ) : (
                scenarios.map((sc) => (
                  <div
                    key={sc.id}
                    className={`group flex items-center gap-1 px-3 py-2 cursor-pointer transition-colors ${
                      selectedId === sc.id
                        ? 'bg-graph-accent/10 text-graph-accent'
                        : 'hover:bg-graph-border text-graph-text'
                    }`}
                    onClick={() => setSelectedId(sc.id)}
                  >
                    <svg className="w-3 h-3 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs truncate flex-1">{sc.title}</span>
                    <span className="text-[10px] text-graph-muted shrink-0">
                      {sc.linkedEntityIds.length}개
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(sc.id) }}
                      className="opacity-0 group-hover:opacity-100 text-graph-muted hover:text-red-400 transition-all ml-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── 오른쪽: 편집 영역 ── */}
          {selected ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 제목 */}
              <div className="px-4 pt-4 pb-2 border-b border-graph-border shrink-0">
                <input
                  value={editTitle}
                  onChange={(e) => { setEditTitle(e.target.value); setIsDirty(true) }}
                  className="w-full bg-transparent text-base font-semibold text-graph-text outline-none placeholder-graph-border"
                  placeholder="시나리오 제목"
                />
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                {/* 내용 편집 */}
                <div className="flex-1 p-4 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-graph-muted">내용</span>
                    {isDirty && (
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary text-xs py-0.5 px-2 h-6"
                      >
                        {saving ? '저장 중...' : '저장'}
                      </button>
                    )}
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => { setEditContent(e.target.value); setIsDirty(true) }}
                    onBlur={handleSave}
                    placeholder={`시나리오 내용을 작성하세요.\n\n예시:\n카이는 블랙스톤 전투에서 루나와 함께 싸웠다.\n전투 후 카이는 그림자 길드의 수장이 되었다.`}
                    className="flex-1 input resize-none text-sm leading-relaxed font-mono min-h-[180px]"
                  />
                </div>

                {/* 엔티티 추출 / 연결 */}
                <div className="border-t border-graph-border px-4 py-3 shrink-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-graph-muted">
                      연결된 엔티티 ({linkedEntities.length}개)
                    </span>
                  </div>

                  {/* 엔티티 생성 & 연결 */}
                  <div className="flex items-center gap-2">
                    {/* 유형 선택 */}
                    <select
                      value={linkEntityType}
                      onChange={(e) => setLinkEntityType(e.target.value as EntityType)}
                      className="input w-28 text-xs h-7"
                    >
                      {(['Event', 'Character', 'Faction', 'Item', 'Location', 'Concept'] as EntityType[]).map((t) => (
                        <option key={t} value={t}>{ENTITY_TYPE_KO[t]}</option>
                      ))}
                    </select>

                    <input
                      value={linkEntityName}
                      onChange={(e) => setLinkEntityName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateEntityFromScenario() }}
                      placeholder="엔티티 이름 입력 후 추가"
                      className="input flex-1 text-xs h-7"
                    />

                    <button
                      onClick={handleCreateEntityFromScenario}
                      disabled={!linkEntityName.trim() || addingEntity}
                      className="btn-primary text-xs h-7 px-3 shrink-0 disabled:opacity-50"
                    >
                      {addingEntity ? '추가 중...' : '+ 생성'}
                    </button>
                  </div>

                  {/* 기존 엔티티 연결 */}
                  <ExistingEntityLinker
                    scenarioId={selected.id}
                    linkedEntityIds={selected.linkedEntityIds}
                    onLink={linkEntityToScenario}
                  />

                  {/* 연결된 엔티티 목록 */}
                  {linkedEntities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {linkedEntities.map((entity) => (
                        <div
                          key={entity.id}
                          className="flex items-center gap-1 bg-graph-border/50 rounded-full pl-2 pr-1 py-0.5"
                        >
                          <EntityTypeBadge type={entity.type} dot />
                          <button
                            onClick={() => { selectEntity(entity.id); onClose() }}
                            className="text-xs text-graph-text hover:text-graph-accent transition-colors"
                          >
                            {entity.name}
                          </button>
                          <button
                            onClick={() => unlinkEntityFromScenario(selected.id, entity.id)}
                            className="text-graph-muted hover:text-red-400 transition-colors ml-0.5"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 가지 관계 시각화 힌트 */}
                {linkedEntities.length > 0 && (
                  <div className="border-t border-graph-border px-4 py-2 shrink-0">
                    <p className="text-[11px] text-graph-muted">
                      💡 그래프에서 엔티티를 클릭하고 핸들을 드래그해 관계를 연결하세요
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-graph-muted text-sm">시나리오를 선택하거나 새로 만드세요</p>
                <button onClick={() => setCreatingNew(true)} className="btn-primary text-xs">
                  + 새 시나리오
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteConfirmId && deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null) }}
        >
          <div
            className="panel rounded-xl w-[min(360px,calc(100vw-2rem))] shadow-2xl border border-graph-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-graph-border">
              <h3 className="text-sm font-semibold text-graph-text">시나리오 삭제</h3>
            </div>
            <div className="px-4 py-3 space-y-2">
              <p className="text-sm text-graph-text">
                다음 시나리오를 삭제할까요? 이 작업은 되돌릴 수 없습니다.
              </p>
              <p className="text-xs text-graph-muted truncate" title={deleteTarget.title}>
                「{deleteTarget.title}」
              </p>
            </div>
            <div className="px-4 py-3 border-t border-graph-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="btn-ghost text-xs px-3 h-8"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleRemove(deleteConfirmId)}
                className="text-xs px-3 h-8 rounded-md bg-red-600/90 text-white hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 기존 엔티티 연결 서브 컴포넌트 ──────────────────────────────────────────

function ExistingEntityLinker({
  scenarioId,
  linkedEntityIds,
  onLink
}: {
  scenarioId: string
  linkedEntityIds: string[]
  onLink: (scenarioId: string, entityId: string) => void
}) {
  const entities = useStore((s) => s.entities)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const unlinked = entities.filter(
    (e) => !linkedEntityIds.includes(e.id) &&
      (search ? e.name.toLowerCase().includes(search.toLowerCase()) : true)
  )

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-graph-accent hover:text-graph-accent-hover flex items-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        기존 엔티티 연결
      </button>

      {open && (
        <div className="absolute bottom-7 left-0 w-64 bg-graph-panel border border-graph-border rounded-lg shadow-xl z-10 overflow-hidden">
          <div className="p-2 border-b border-graph-border">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름으로 검색..."
              className="input text-xs h-6"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {unlinked.length === 0 ? (
              <p className="text-xs text-graph-muted text-center py-3">엔티티 없음</p>
            ) : (
              unlinked.slice(0, 20).map((e) => (
                <button
                  key={e.id}
                  onClick={() => { onLink(scenarioId, e.id); setOpen(false); setSearch('') }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-graph-border text-left transition-colors"
                >
                  <EntityTypeBadge type={e.type} dot />
                  <span className="text-graph-text truncate">{e.name}</span>
                  <span className="text-graph-muted ml-auto shrink-0">{ENTITY_TYPE_KO[e.type as keyof typeof ENTITY_TYPE_KO] ?? e.type}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
