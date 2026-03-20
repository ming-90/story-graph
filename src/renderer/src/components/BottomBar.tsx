import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function BottomBar() {
  const suggestions = useStore((s) => s.suggestions)
  const [open, setOpen] = useState(false)

  const pendingCount = suggestions.filter((s) => s.status === 'pending').length

  return (
    <div className="panel shrink-0 border-t border-graph-border z-10">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-graph-muted hover:text-graph-text hover:bg-graph-border/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span className="font-medium text-graph-text">AI 제안 대기열</span>
          {pendingCount > 0 && (
            <span className="w-4 h-4 text-[10px] bg-graph-accent rounded-full flex items-center justify-center text-white">
              {pendingCount}
            </span>
          )}
          {pendingCount === 0 && (
            <span className="text-graph-muted">대기 중인 제안 없음</span>
          )}
        </div>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Suggestion list */}
      {open && (
        <div className="border-t border-graph-border overflow-x-auto">
          {pendingCount === 0 ? (
            <p className="text-xs text-graph-muted text-center py-5">
              대기 중인 AI 제안이 없습니다
            </p>
          ) : (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {suggestions
                .filter((s) => s.status === 'pending')
                .map((sug) => (
                  <div
                    key={sug.id}
                    className="shrink-0 w-56 p-2.5 rounded bg-graph-border/50 text-xs space-y-1 border border-graph-border"
                  >
                    <span className="badge status-pending">{sug.suggestionType}</span>
                    {sug.reasonSummary && (
                      <p className="text-graph-muted line-clamp-2 mt-1">{sug.reasonSummary}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
