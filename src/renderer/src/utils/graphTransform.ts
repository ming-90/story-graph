import type { Entity, Relation, StructuralEdge } from '../../../shared/types'
import type { AppNode, AppEdge } from '../types/graph'
import { toRelationTypeKo } from '../components/shared/Badges'

const NODE_TYPE_COLORS: Record<string, string> = {
  Character: '#6366f1',
  Faction: '#f59e0b',
  Event: '#10b981',
  Item: '#3b82f6',
  Location: '#ec4899',
  Concept: '#8b5cf6',
  Evidence: '#94a3b8'
}

const COLS = 6
const H_GAP = 220
const V_GAP = 160

export function entitiesToNodes(entities: Entity[]): AppNode[] {
  return entities.map((entity, i) => ({
    id: entity.id,
    type: 'entityNode',
    position: {
      x: (i % COLS) * H_GAP + 60,
      y: Math.floor(i / COLS) * V_GAP + 60
    },
    data: entity,
    style: {
      borderColor: NODE_TYPE_COLORS[entity.type] ?? '#6366f1'
    }
  }))
}

export function relationsToEdges(relations: Relation[]): AppEdge[] {
  return relations.map((rel) => ({
    id: rel.id,
    source: rel.from,
    target: rel.to,
    label: toRelationTypeKo(rel.type),
    type: 'semanticEdge',
    animated: rel.status === 'proposed',
    data: { relation: rel, edgeKind: 'semantic' as const },
    style: {
      stroke:
        rel.status === 'verified'
          ? '#10b981'
          : rel.status === 'rejected'
            ? '#ef4444'
            : '#6366f1',
      strokeWidth: 1.5,
      strokeDasharray: rel.status === 'proposed' ? '5,5' : undefined
    },
    labelStyle: { fill: '#94a3b8', fontSize: 10 },
    labelBgStyle: { fill: '#1a1d27' }
  }))
}

export function structuralEdgesToEdges(edges: StructuralEdge[]): AppEdge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    label: toRelationTypeKo(edge.type),
    type: 'default',
    data: { structural: edge, edgeKind: 'structural' as const },
    style: { stroke: '#64748b', strokeWidth: 1 },
    labelStyle: { fill: '#64748b', fontSize: 10 },
    labelBgStyle: { fill: '#1a1d27' }
  }))
}
