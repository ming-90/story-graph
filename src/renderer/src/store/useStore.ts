import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange } from '@xyflow/react'
import { api } from '../utils/api'
import type {
  Entity,
  Relation,
  StructuralEdge,
  Evidence,
  AISuggestion,
  Scenario,
  CreateEntityInput,
  UpdateEntityInput,
  CreateRelationInput,
  UpdateRelationInput,
  CreateStructuralEdgeInput,
  CreateEvidenceInput,
  CreateSuggestionInput,
  CreateScenarioInput,
  UpdateScenarioInput,
  RelationStatus,
  SuggestionStatus
} from '../../../shared/types'
import type { AppNode, AppEdge } from '../types/graph'
import { entitiesToNodes, relationsToEdges, structuralEdgesToEdges } from '../utils/graphTransform'

interface SelectionState {
  selectedEntityId: string | null
  selectedRelationId: string | null
}

interface FilterState {
  entityTypeFilter: string[]
  searchQuery: string
  showStructuralEdges: boolean
  showSemanticRelations: boolean
  statusFilter: RelationStatus[]
}

interface UIState {
  rightPanelOpen: boolean
  suggestionPanelOpen: boolean
  isLoading: boolean
}

interface GraphState {
  nodes: AppNode[]
  edges: AppEdge[]
  onNodesChange: (changes: NodeChange<AppNode>[]) => void
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => void
}

interface StoreState
  extends SelectionState,
    FilterState,
    UIState,
    GraphState {
  entities: Entity[]
  relations: Relation[]
  structuralEdges: StructuralEdge[]
  evidence: Evidence[]
  suggestions: AISuggestion[]
  scenarios: Scenario[]

  // Data loading
  loadAll: () => Promise<void>

  // Entity actions
  createEntity: (input: CreateEntityInput) => Promise<Entity>
  updateEntity: (id: string, input: UpdateEntityInput) => Promise<void>
  removeEntity: (id: string) => Promise<void>
  searchEntities: (query: string) => Promise<Entity[]>

  // Relation actions
  createRelation: (input: CreateRelationInput) => Promise<Relation>
  updateRelation: (id: string, input: UpdateRelationInput) => Promise<void>
  updateRelationStatus: (id: string, status: RelationStatus) => Promise<void>
  removeRelation: (id: string) => Promise<void>

  // Structural edge actions
  createStructuralEdge: (input: CreateStructuralEdgeInput) => Promise<StructuralEdge>
  removeStructuralEdge: (id: string) => Promise<void>

  // Evidence actions
  createEvidence: (input: CreateEvidenceInput) => Promise<Evidence>
  removeEvidence: (id: string) => Promise<void>

  // Suggestion actions
  createSuggestion: (input: CreateSuggestionInput) => Promise<AISuggestion>
  acceptSuggestion: (id: string) => Promise<void>
  rejectSuggestion: (id: string) => Promise<void>
  updateSuggestionStatus: (id: string, status: SuggestionStatus) => Promise<void>

  // Selection
  selectEntity: (id: string | null) => void
  selectRelation: (id: string | null) => void

  // Filters
  setEntityTypeFilter: (types: string[]) => void
  setSearchQuery: (query: string) => void
  toggleStructuralEdges: () => void
  toggleSemanticRelations: () => void
  setStatusFilter: (statuses: RelationStatus[]) => void

  // UI
  setRightPanelOpen: (open: boolean) => void
  setSuggestionPanelOpen: (open: boolean) => void

  // Scenario actions
  createScenario: (input: CreateScenarioInput) => Promise<Scenario>
  updateScenario: (id: string, input: UpdateScenarioInput) => Promise<void>
  removeScenario: (id: string) => Promise<void>
  linkEntityToScenario: (scenarioId: string, entityId: string) => Promise<void>
  unlinkEntityFromScenario: (scenarioId: string, entityId: string) => Promise<void>

  // Internal graph sync
  _syncGraph: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  // ─── Data ─────────────────────────────────────────────────────────────────
  entities: [],
  scenarios: [],
  relations: [],
  structuralEdges: [],
  evidence: [],
  suggestions: [],

  // ─── Graph ────────────────────────────────────────────────────────────────
  nodes: [],
  edges: [],
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  // ─── Selection ────────────────────────────────────────────────────────────
  selectedEntityId: null,
  selectedRelationId: null,

  // ─── Filters ──────────────────────────────────────────────────────────────
  entityTypeFilter: [],
  searchQuery: '',
  showStructuralEdges: true,
  showSemanticRelations: true,
  statusFilter: ['proposed', 'verified'],

  // ─── UI ───────────────────────────────────────────────────────────────────
  rightPanelOpen: false,
  suggestionPanelOpen: true,
  isLoading: false,

  // ─── Load all data ────────────────────────────────────────────────────────
  loadAll: async () => {
    set({ isLoading: true })
    try {
      const [entities, relations, structuralEdges, evidence, suggestions] = await Promise.all([
        api.entities.getAll(),
        api.relations.getAll(),
        api.structuralEdges.getAll(),
        api.evidence.getAll(),
        api.suggestions.getAll()
      ])
      set({ entities, relations, structuralEdges, evidence, suggestions })
      get()._syncGraph()
    } catch (e) {
      console.error('[loadAll] 기본 데이터 로드 실패:', e)
    }

    // 시나리오는 별도로 로드 (실패해도 다른 데이터에 영향 없음)
    try {
      const scenarios = await api.scenarios.getAll()
      set({ scenarios })
    } catch (e) {
      console.error('[loadAll] 시나리오 로드 실패:', e)
    }

    set({ isLoading: false })
  },

  // ─── Entity actions ───────────────────────────────────────────────────────
  createEntity: async (input) => {
    const entity = await api.entities.create(input)
    set((s) => ({ entities: [entity, ...s.entities] }))
    get()._syncGraph()
    return entity
  },

  updateEntity: async (id, input) => {
    const updated = await api.entities.update(id, input)
    if (!updated) return
    set((s) => ({ entities: s.entities.map((e) => (e.id === id ? updated : e)) }))
    get()._syncGraph()
  },

  removeEntity: async (id) => {
    await api.entities.remove(id)
    set((s) => ({
      entities: s.entities.filter((e) => e.id !== id),
      selectedEntityId: s.selectedEntityId === id ? null : s.selectedEntityId
    }))
    get()._syncGraph()
  },

  searchEntities: async (query) => {
    return api.entities.search(query)
  },

  // ─── Relation actions ─────────────────────────────────────────────────────
  createRelation: async (input) => {
    const relation = await api.relations.create(input)
    set((s) => ({ relations: [relation, ...s.relations] }))
    get()._syncGraph()
    return relation
  },

  updateRelation: async (id, input) => {
    const updated = await api.relations.update(id, input)
    if (!updated) return
    set((s) => ({ relations: s.relations.map((r) => (r.id === id ? updated : r)) }))
    get()._syncGraph()
  },

  updateRelationStatus: async (id, status) => {
    await api.relations.updateStatus(id, status)
    set((s) => ({
      relations: s.relations.map((r) => (r.id === id ? { ...r, status } : r))
    }))
    get()._syncGraph()
  },

  removeRelation: async (id) => {
    await api.relations.remove(id)
    set((s) => ({ relations: s.relations.filter((r) => r.id !== id) }))
    get()._syncGraph()
  },

  // ─── Structural edge actions ──────────────────────────────────────────────
  createStructuralEdge: async (input) => {
    const edge = await api.structuralEdges.create(input)
    set((s) => ({ structuralEdges: [edge, ...s.structuralEdges] }))
    get()._syncGraph()
    return edge
  },

  removeStructuralEdge: async (id) => {
    await api.structuralEdges.remove(id)
    set((s) => ({ structuralEdges: s.structuralEdges.filter((e) => e.id !== id) }))
    get()._syncGraph()
  },

  // ─── Evidence actions ─────────────────────────────────────────────────────
  createEvidence: async (input) => {
    const ev = await api.evidence.create(input)
    set((s) => ({ evidence: [ev, ...s.evidence] }))
    return ev
  },

  removeEvidence: async (id) => {
    await api.evidence.remove(id)
    set((s) => ({ evidence: s.evidence.filter((e) => e.id !== id) }))
  },

  // ─── Suggestion actions ───────────────────────────────────────────────────
  createSuggestion: async (input) => {
    const sug = await api.suggestions.create(input)
    set((s) => ({ suggestions: [sug, ...s.suggestions] }))
    return sug
  },

  acceptSuggestion: async (id) => {
    await api.suggestions.updateStatus(id, 'accepted')
    set((s) => ({
      suggestions: s.suggestions.map((sg) => (sg.id === id ? { ...sg, status: 'accepted' as const } : sg))
    }))
  },

  rejectSuggestion: async (id) => {
    await api.suggestions.updateStatus(id, 'rejected')
    set((s) => ({
      suggestions: s.suggestions.map((sg) => (sg.id === id ? { ...sg, status: 'rejected' as const } : sg))
    }))
  },

  updateSuggestionStatus: async (id, status) => {
    await api.suggestions.updateStatus(id, status)
    set((s) => ({
      suggestions: s.suggestions.map((sg) => (sg.id === id ? { ...sg, status } : sg))
    }))
  },

  // ─── Selection ────────────────────────────────────────────────────────────
  selectEntity: (id) =>
    set({ selectedEntityId: id, selectedRelationId: null, rightPanelOpen: id !== null }),

  selectRelation: (id) =>
    set({ selectedRelationId: id, selectedEntityId: null, rightPanelOpen: id !== null }),

  // ─── Filters ──────────────────────────────────────────────────────────────
  setEntityTypeFilter: (types) => {
    set({ entityTypeFilter: types })
    get()._syncGraph()
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleStructuralEdges: () => {
    set((s) => ({ showStructuralEdges: !s.showStructuralEdges }))
    get()._syncGraph()
  },

  toggleSemanticRelations: () => {
    set((s) => ({ showSemanticRelations: !s.showSemanticRelations }))
    get()._syncGraph()
  },

  setStatusFilter: (statuses) => {
    set({ statusFilter: statuses })
    get()._syncGraph()
  },

  // ─── UI ───────────────────────────────────────────────────────────────────
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setSuggestionPanelOpen: (open) => set({ suggestionPanelOpen: open }),

  // ─── Scenario actions ─────────────────────────────────────────────────────
  createScenario: async (input) => {
    const scenario = await api.scenarios.create(input)
    set((s) => ({ scenarios: [scenario, ...s.scenarios] }))
    return scenario
  },

  updateScenario: async (id, input) => {
    const updated = await api.scenarios.update(id, input)
    if (!updated) return
    set((s) => ({ scenarios: s.scenarios.map((sc) => (sc.id === id ? updated : sc)) }))
  },

  removeScenario: async (id) => {
    await api.scenarios.remove(id)
    set((s) => ({ scenarios: s.scenarios.filter((sc) => sc.id !== id) }))
  },

  linkEntityToScenario: async (scenarioId, entityId) => {
    const scenario = get().scenarios.find((sc) => sc.id === scenarioId)
    if (!scenario || scenario.linkedEntityIds.includes(entityId)) return
    const newIds = [...scenario.linkedEntityIds, entityId]
    await api.scenarios.update(scenarioId, { linkedEntityIds: newIds })
    set((s) => ({
      scenarios: s.scenarios.map((sc) =>
        sc.id === scenarioId ? { ...sc, linkedEntityIds: newIds } : sc
      )
    }))
  },

  unlinkEntityFromScenario: async (scenarioId, entityId) => {
    const scenario = get().scenarios.find((sc) => sc.id === scenarioId)
    if (!scenario) return
    const newIds = scenario.linkedEntityIds.filter((id) => id !== entityId)
    await api.scenarios.update(scenarioId, { linkedEntityIds: newIds })
    set((s) => ({
      scenarios: s.scenarios.map((sc) =>
        sc.id === scenarioId ? { ...sc, linkedEntityIds: newIds } : sc
      )
    }))
  },

  // ─── Internal graph sync ──────────────────────────────────────────────────
  _syncGraph: () => {
    const { entities, relations, structuralEdges, entityTypeFilter, showStructuralEdges, showSemanticRelations, statusFilter } =
      get()

    const filteredEntities =
      entityTypeFilter.length > 0
        ? entities.filter((e) => entityTypeFilter.includes(e.type))
        : entities

    const filteredRelations = showSemanticRelations
      ? relations.filter((r) => statusFilter.includes(r.status))
      : []

    const filteredStructural = showStructuralEdges ? structuralEdges : []

    const nodes = entitiesToNodes(filteredEntities)
    const edges = [
      ...relationsToEdges(filteredRelations),
      ...structuralEdgesToEdges(filteredStructural)
    ]

    set({ nodes, edges })
  }
}))
