import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type OnConnect,
  BackgroundVariant
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '../store/useStore'
import EntityNode from './nodes/EntityNode'
import type { AppEdge } from '../types/graph'

const nodeTypes = {
  entityNode: EntityNode
}

interface GraphCanvasProps {
  onConnect?: (fromId: string, toId: string) => void
}

export default function GraphCanvas({ onConnect: onConnectProp }: GraphCanvasProps) {
  const nodes = useStore((s) => s.nodes)
  const edges = useStore((s) => s.edges)
  const onNodesChange = useStore((s) => s.onNodesChange)
  const onEdgesChange = useStore((s) => s.onEdgesChange)
  const selectEntity = useStore((s) => s.selectEntity)
  const selectRelation = useStore((s) => s.selectRelation)

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      selectEntity(node.id)
    },
    [selectEntity]
  )

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      const appEdge = edge as AppEdge
      if (appEdge.data?.edgeKind === 'semantic' && appEdge.data.relation) {
        selectRelation(appEdge.data.relation.id)
      }
    },
    [selectRelation]
  )

  const onPaneClick = useCallback(() => {
    selectEntity(null)
  }, [selectEntity])

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target && onConnectProp) {
        onConnectProp(connection.source, connection.target)
      }
    },
    [onConnectProp]
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0f1117' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#2a2d3e"
        />
        <Controls
          className="!bg-graph-panel !border-graph-border [&_button]:!bg-graph-panel [&_button]:!border-graph-border [&_button]:!text-graph-muted [&_button:hover]:!bg-graph-border"
        />
        <MiniMap
          nodeColor={(node) => {
            const colorMap: Record<string, string> = {
              Character: '#6366f1',
              Faction: '#f59e0b',
              Event: '#10b981',
              Item: '#3b82f6',
              Location: '#ec4899',
              Concept: '#8b5cf6',
              Evidence: '#94a3b8'
            }
            return colorMap[(node.data as any)?.type] ?? '#6366f1'
          }}
          maskColor="rgba(15, 17, 23, 0.8)"
          style={{ background: '#1a1d27', border: '1px solid #2a2d3e' }}
        />

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-graph-muted text-sm">엔티티가 없습니다</p>
            <p className="text-graph-border text-xs mt-1">
              상단 바의 "+ 엔티티" 버튼으로 시작하세요
            </p>
          </div>
        )}
      </ReactFlow>
    </div>
  )
}
