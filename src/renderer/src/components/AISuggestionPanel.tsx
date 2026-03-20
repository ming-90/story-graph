import { useStore } from '../store/useStore'
import { ConfidenceBar, toRelationTypeKo } from './shared/Badges'

export default function AISuggestionPanel() {
  const suggestions = useStore((s) => s.suggestions)
  const acceptSuggestion = useStore((s) => s.acceptSuggestion)
  const rejectSuggestion = useStore((s) => s.rejectSuggestion)
  const setSuggestionPanelOpen = useStore((s) => s.setSuggestionPanelOpen)
  const entities = useStore((s) => s.entities)
  const createRelation = useStore((s) => s.createRelation)

  const pending = suggestions.filter((s) => s.status === 'pending')

  const handleAccept = async (suggestionId: string) => {
    const sug = suggestions.find((s) => s.id === suggestionId)
    if (!sug) return

    if (sug.suggestionType === 'ADD_RELATION') {
      const data = sug.data as any
      const fromEntity = entities.find((e) => e.name === data.relation?.from || e.id === data.relation?.from)
      const toEntity = entities.find((e) => e.name === data.relation?.to || e.id === data.relation?.to)
      if (fromEntity && toEntity) {
        await createRelation({
          type: data.relation.type,
          from: fromEntity.id,
          to: toEntity.id,
          confidence: data.relation.confidence ?? 0,
          status: 'verified',
          supportedBy: sug.evidenceRefs
        })
      }
    }

    await acceptSuggestion(suggestionId)
  }

  return (
    <aside className="panel w-72 shrink-0 flex flex-col border-l overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-graph-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-graph-text">AI 제안</span>
          {pending.length > 0 && (
            <span className="w-4 h-4 text-[10px] bg-graph-accent rounded-full flex items-center justify-center text-white">
              {pending.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setSuggestionPanelOpen(false)}
          className="text-graph-muted hover:text-graph-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="w-8 h-8 rounded-full bg-graph-border flex items-center justify-center">
              <svg className="w-4 h-4 text-graph-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xs text-graph-muted text-center">
              대기 중인 제안 없음
            </p>
            <p className="text-[11px] text-graph-border text-center">
              엔티티를 선택하고 AI 제안을 요청하세요
            </p>
          </div>
        ) : (
          pending.map((sug) => {
            const data = sug.data as any
            const relation = data?.relation

            return (
              <div
                key={sug.id}
                className="rounded-lg border border-graph-border bg-graph-border/20 overflow-hidden"
              >
                {/* Suggestion header */}
                <div className="px-3 py-2 border-b border-graph-border flex items-center gap-2">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {sug.suggestionType}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  {/* Relation summary */}
                  {relation && (
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-graph-muted">{relation.from}</span>
                        <span className="text-graph-accent font-medium">─ {toRelationTypeKo(relation.type)} →</span>
                        <span className="text-graph-muted">{relation.to}</span>
                      </div>
                      {relation.confidence != null && (
                        <ConfidenceBar value={relation.confidence} />
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  {sug.reasonSummary && (
                    <p className="text-xs text-graph-muted line-clamp-3">
                      {sug.reasonSummary}
                    </p>
                  )}

                  {/* Evidence refs */}
                  {sug.evidenceRefs.length > 0 && (
                    <p className="text-xs text-graph-muted">
                      근거: {sug.evidenceRefs.join(', ')}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleAccept(sug.id)}
                      className="flex-1 text-xs py-1.5 rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
                    >
                      수락
                    </button>
                    <button className="flex-1 text-xs py-1.5 rounded bg-graph-border hover:bg-graph-accent/20 text-graph-muted hover:text-graph-accent transition-colors">
                      편집
                    </button>
                    <button
                      onClick={() => rejectSuggestion(sug.id)}
                      className="flex-1 text-xs py-1.5 rounded bg-graph-border hover:bg-red-600/20 text-graph-muted hover:text-red-400 transition-colors"
                    >
                      거절
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Accepted/rejected history */}
        {suggestions.filter((s) => s.status !== 'pending').length > 0 && (
          <div>
            <p className="text-xs text-graph-muted mb-2">처리 내역</p>
            <div className="space-y-1">
              {suggestions
                .filter((s) => s.status !== 'pending')
                .slice(0, 5)
                .map((sug) => (
                  <div
                    key={sug.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs"
                  >
                    <span
                      className={`badge ${
                        sug.status === 'accepted' ? 'status-accepted' : 'status-rejected'
                      }`}
                    >
                      {sug.status === 'accepted' ? '수락됨' : '거절됨'}
                    </span>
                    <span className="text-graph-muted truncate flex-1">
                      {sug.suggestionType}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
