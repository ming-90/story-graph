import { useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useStore } from './store/useStore'
import TopBar from './components/TopBar'
import LeftPanel from './components/LeftPanel'
import GraphCanvas from './components/GraphCanvas'
import RightPanel from './components/RightPanel'
import AISuggestionPanel from './components/AISuggestionPanel'
import CreateEntityModal from './components/modals/CreateEntityModal'
import CreateRelationModal from './components/modals/CreateRelationModal'
import ScenarioPanel from './components/ScenarioPanel'
import { useState } from 'react'

export default function App() {
  const loadAll = useStore((s) => s.loadAll)
  const rightPanelOpen = useStore((s) => s.rightPanelOpen)
  const suggestionPanelOpen = useStore((s) => s.suggestionPanelOpen)

  const [createEntityOpen, setCreateEntityOpen] = useState(false)
  const [createRelationOpen, setCreateRelationOpen] = useState(false)
  const [scenarioPanelOpen, setScenarioPanelOpen] = useState(false)
  const [openScenarioId, setOpenScenarioId] = useState<string | undefined>(undefined)
  const [pendingConnection, setPendingConnection] = useState<{ fromId: string; toId: string } | null>(null)

  const handleGraphConnect = (fromId: string, toId: string) => {
    setPendingConnection({ fromId, toId })
    setCreateRelationOpen(true)
  }

  const handleRelationModalClose = () => {
    setCreateRelationOpen(false)
    setPendingConnection(null)
  }

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-graph-bg">
      <TopBar
        onCreateEntity={() => setCreateEntityOpen(true)}
        onCreateRelation={() => setCreateRelationOpen(true)}
        onOpenScenario={() => setScenarioPanelOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />

        <main className="flex-1 relative overflow-hidden">
          <ReactFlowProvider>
            <GraphCanvas onConnect={handleGraphConnect} />
          </ReactFlowProvider>
        </main>

        {rightPanelOpen && (
          <RightPanel
            onOpenScenario={(id) => {
              setOpenScenarioId(id)
              setScenarioPanelOpen(true)
            }}
          />
        )}

        {suggestionPanelOpen && <AISuggestionPanel />}
      </div>

      {createEntityOpen && (
        <CreateEntityModal onClose={() => setCreateEntityOpen(false)} />
      )}

      {createRelationOpen && (
        <CreateRelationModal
          onClose={handleRelationModalClose}
          initialFromId={pendingConnection?.fromId}
          initialToId={pendingConnection?.toId}
        />
      )}

      {scenarioPanelOpen && (
        <ScenarioPanel
          onClose={() => {
            setScenarioPanelOpen(false)
            setOpenScenarioId(undefined)
          }}
          initialScenarioId={openScenarioId}
        />
      )}
    </div>
  )
}
