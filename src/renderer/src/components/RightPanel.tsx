import { useStore } from '../store/useStore'
import EntityDetail from './panels/EntityDetail'
import RelationDetail from './panels/RelationDetail'

interface RightPanelProps {
  onOpenScenario?: (scenarioId: string) => void
}

export default function RightPanel({ onOpenScenario }: RightPanelProps) {
  const selectedEntityId = useStore((s) => s.selectedEntityId)
  const selectedRelationId = useStore((s) => s.selectedRelationId)
  const setRightPanelOpen = useStore((s) => s.setRightPanelOpen)

  return (
    <aside className="panel w-72 shrink-0 flex flex-col border-l overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-graph-border">
        <span className="text-xs font-medium text-graph-text">
          {selectedEntityId ? '엔티티 상세' : selectedRelationId ? '관계 상세' : '상세 정보'}
        </span>
        <button
          onClick={() => setRightPanelOpen(false)}
          className="text-graph-muted hover:text-graph-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedEntityId && (
          <EntityDetail entityId={selectedEntityId} onOpenScenario={onOpenScenario} />
        )}
        {selectedRelationId && <RelationDetail relationId={selectedRelationId} />}
        {!selectedEntityId && !selectedRelationId && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-graph-muted">노드 또는 엣지를 선택하세요</p>
          </div>
        )}
      </div>
    </aside>
  )
}
