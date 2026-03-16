// ─── Entity ──────────────────────────────────────────────────────────────────

export type EntityType =
  | 'Character'
  | 'Faction'
  | 'Event'
  | 'Item'
  | 'Location'
  | 'Concept'
  | 'Evidence'

export interface Entity {
  id: string
  type: EntityType
  name: string
  attributes: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

export interface CreateEntityInput {
  type: EntityType
  name: string
  attributes?: Record<string, unknown>
}

export interface UpdateEntityInput {
  name?: string
  attributes?: Record<string, unknown>
}

// ─── Structural Edge ──────────────────────────────────────────────────────────

export type StructuralEdgeType = 'belongs_to' | 'owns' | 'located_in' | 'part_of' | string

export interface StructuralEdge {
  id: string
  type: StructuralEdgeType
  from: string
  to: string
  createdAt: number
}

export interface CreateStructuralEdgeInput {
  type: StructuralEdgeType
  from: string
  to: string
}

// ─── Semantic Relation ────────────────────────────────────────────────────────

export type RelationType =
  | 'ALLY_OF'
  | 'ENEMY_OF'
  | 'CAUSED_BY'
  | 'CONTRACT_WITH'
  | 'KNOWS'
  | 'MEMBER_OF'
  | string

export type RelationStatus = 'proposed' | 'verified' | 'rejected'

export interface Relation {
  id: string
  type: RelationType
  from: string
  to: string
  confidence: number
  validFrom?: string
  validTo?: string
  status: RelationStatus
  supportedBy: string[]
  createdAt: number
  updatedAt: number
}

export interface CreateRelationInput {
  type: RelationType
  from: string
  to: string
  confidence?: number
  validFrom?: string
  validTo?: string
  status?: RelationStatus
  supportedBy?: string[]
}

export interface UpdateRelationInput {
  type?: RelationType
  confidence?: number
  validFrom?: string
  validTo?: string
  status?: RelationStatus
  supportedBy?: string[]
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export interface Evidence {
  id: string
  text: string
  source?: string
  embeddingId?: string
  entityRefs: string[]
  createdAt: number
}

export interface CreateEvidenceInput {
  text: string
  source?: string
  embeddingId?: string
  entityRefs?: string[]
}

// ─── AI Suggestion ────────────────────────────────────────────────────────────

export type SuggestionType = 'ADD_RELATION' | 'UPDATE_RELATION' | 'ADD_ENTITY' | 'ADD_STRUCTURAL_EDGE'
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected'

export interface AISuggestion {
  id: string
  suggestionType: SuggestionType
  data: Record<string, unknown>
  evidenceRefs: string[]
  reasonSummary?: string
  status: SuggestionStatus
  createdAt: number
}

export interface CreateSuggestionInput {
  suggestionType: SuggestionType
  data: Record<string, unknown>
  evidenceRefs?: string[]
  reasonSummary?: string
}

// ─── Scenario ─────────────────────────────────────────────────────────────────

export interface Scenario {
  id: string
  title: string
  content: string
  linkedEntityIds: string[]
  createdAt: number
  updatedAt: number
}

export interface CreateScenarioInput {
  title: string
  content: string
}

export interface UpdateScenarioInput {
  title?: string
  content?: string
  linkedEntityIds?: string[]
}

// ─── IPC API ──────────────────────────────────────────────────────────────────

export interface IpcApi {
  entities: {
    getAll: () => Promise<Entity[]>
    getById: (id: string) => Promise<Entity | null>
    getByType: (type: string) => Promise<Entity[]>
    create: (input: CreateEntityInput) => Promise<Entity>
    update: (id: string, input: UpdateEntityInput) => Promise<Entity | null>
    remove: (id: string) => Promise<boolean>
    search: (query: string) => Promise<Entity[]>
  }
  relations: {
    getAll: () => Promise<Relation[]>
    getByEntity: (entityId: string) => Promise<Relation[]>
    create: (input: CreateRelationInput) => Promise<Relation>
    update: (id: string, input: UpdateRelationInput) => Promise<Relation | null>
    updateStatus: (id: string, status: RelationStatus) => Promise<boolean>
    remove: (id: string) => Promise<boolean>
  }
  structuralEdges: {
    getAll: () => Promise<StructuralEdge[]>
    getByEntity: (entityId: string) => Promise<StructuralEdge[]>
    create: (input: CreateStructuralEdgeInput) => Promise<StructuralEdge>
    remove: (id: string) => Promise<boolean>
  }
  evidence: {
    getAll: () => Promise<Evidence[]>
    getById: (id: string) => Promise<Evidence | null>
    getByEntityRef: (entityId: string) => Promise<Evidence[]>
    create: (input: CreateEvidenceInput) => Promise<Evidence>
    remove: (id: string) => Promise<boolean>
  }
  suggestions: {
    getAll: () => Promise<AISuggestion[]>
    getPending: () => Promise<AISuggestion[]>
    create: (input: CreateSuggestionInput) => Promise<AISuggestion>
    updateStatus: (id: string, status: SuggestionStatus) => Promise<boolean>
    remove: (id: string) => Promise<boolean>
  }
  scenarios: {
    getAll: () => Promise<Scenario[]>
    getById: (id: string) => Promise<Scenario | null>
    create: (input: CreateScenarioInput) => Promise<Scenario>
    update: (id: string, input: UpdateScenarioInput) => Promise<Scenario | null>
    remove: (id: string) => Promise<boolean>
  }
}
