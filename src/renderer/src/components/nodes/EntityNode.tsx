import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Entity } from '../../../../shared/types'
import { useStore } from '../../store/useStore'

const TYPE_COLOR: Record<string, string> = {
  Character: '#6366f1',
  Faction: '#f59e0b',
  Event: '#10b981',
  Item: '#3b82f6',
  Location: '#ec4899',
  Concept: '#8b5cf6',
  Evidence: '#94a3b8'
}

const TYPE_ICON: Record<string, string> = {
  Character: '👤',
  Faction: '🏛',
  Event: '⚡',
  Item: '🔮',
  Location: '📍',
  Concept: '💡',
  Evidence: '📄'
}

export default memo(function EntityNode({ data, selected }: NodeProps) {
  const entity = data as unknown as Entity
  const color = TYPE_COLOR[entity.type] ?? '#6366f1'
  const icon = TYPE_ICON[entity.type] ?? '●'

  return (
    <div
      className="relative px-3 py-2 rounded-lg text-xs transition-all"
      style={{
        minWidth: 120,
        background: '#1a1d27',
        border: `1.5px solid ${selected ? color : '#2a2d3e'}`,
        boxShadow: selected ? `0 0 0 2px ${color}33` : 'none'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color, width: 8, height: 8, border: 'none' }}
      />

      <div className="flex items-center gap-1.5 mb-1">
        <span>{icon}</span>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {entity.type}
        </span>
      </div>

      <p className="font-semibold text-graph-text truncate max-w-[140px]">{entity.name}</p>

      {Object.keys(entity.attributes ?? {}).length > 0 && (
        <div className="mt-1 space-y-0.5">
          {Object.entries(entity.attributes ?? {})
            .slice(0, 2)
            .map(([k, v]) => (
              <p key={k} className="text-graph-muted truncate">
                <span className="text-graph-border">{k}:</span> {String(v)}
              </p>
            ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color, width: 8, height: 8, border: 'none' }}
      />
    </div>
  )
})
