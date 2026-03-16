import type { Node, Edge } from '@xyflow/react'
import type { Entity, Relation, StructuralEdge } from '../../../shared/types'

export type AppNode = Node<Entity>

export type AppEdge = Edge<{
  relation?: Relation
  structural?: StructuralEdge
  edgeKind: 'semantic' | 'structural'
}>
