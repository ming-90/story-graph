# Context Layer Editor – Specification

## 1. Overview

This project implements a **Context Layer Editor** for managing structured knowledge used by AI systems.

The system allows users to:

- Visualize entities and relationships in a graph
- Create and edit entities and relations
- Receive AI-generated suggestions for relations
- Verify AI suggestions using evidence
- Update the context layer through a human-in-the-loop workflow

The system architecture consists of:

- Graph-based knowledge structure
- Evidence-based validation
- AI-assisted relation suggestion
- Graph visualization interface


---

# 2. Architecture Overview

Source Layer  
↓  
Evidence Layer (Vector DB - Qdrant)  
↓  
Entity Layer  
↓  
Relation Layer  
↓  
State Layer (Structural Edge)

Component Responsibilities:

| Component | Responsibility |
|---|---|
| Graph DB (Neo4j) | Store entities and relations |
| Vector DB (Qdrant) | Store document embeddings and evidence |
| LLM | Generate relation suggestions |
| Frontend (React) | Graph visualization and editing UI |


---

# 3. Context Layer Data Model

## 3.1 Node Types

| Node Type | Description |
|---|---|
| Character | Game characters |
| Faction | Organizations or groups |
| Event | Story events |
| Item | Objects, artifacts |
| Location | Physical locations |
| Concept | Abstract concepts or lore |
| Evidence | Document chunks used as supporting evidence |


---

## 3.2 Entity Schema

Example entity structure.

```json
{
  "id": "CHAR_001",
  "type": "Character",
  "name": "Kai",
  "attributes": {
    "role": "Mercenary",
    "status": "active"
  }
}
```

---

## 3.3 Structural Edge (State Layer)

Structural edges represent **current state relationships**.

Examples:

- belongs_to
- owns
- located_in
- part_of

Example:

Character(Kai) ── owns ──> Item(ShadowOrb)

Structural edges:

- lightweight
- stable
- no evidence required


---

## 3.4 Semantic Relation (Relation Layer)

Semantic relations represent **meaningful relationships requiring validation**.

Examples:

- ALLY_OF
- ENEMY_OF
- CAUSED_BY
- CONTRACT_WITH

Example structure:

```json
{
  "id": "REL_001",
  "type": "ALLY_OF",
  "from": "CHAR_001",
  "to": "CHAR_002",
  "confidence": 0.82,
  "valid_from": "Chapter2",
  "status": "proposed",
  "supported_by": ["EV_8841"]
}
```

Relation attributes:

| Field | Description |
|---|---|
| from | source entity |
| to | target entity |
| confidence | AI confidence score |
| valid_from | relation start |
| valid_to | relation end |
| status | proposed / verified / rejected |
| supported_by | evidence references |


---

# 4. Evidence Layer

Evidence represents document chunks extracted from source material.

Examples of sources:

- scenario documents
- game scripts
- lore documentation
- patch notes

Example evidence schema:

```json
{
  "id": "EV_8841",
  "text": "Kai fought alongside Luna during the Blackstone battle.",
  "source": "Scenario_Chapter2",
  "embedding_id": "vec_8841",
  "entity_refs": ["CHAR_001", "CHAR_002", "EVENT_003"]
}
```

Evidence is stored in **Qdrant**.

Evidence may support:

- entity attributes
- semantic relations
- events


---

# 5. AI Suggestion Workflow

AI generates suggestions when:

- a new node is created
- a relation is edited
- a node is inspected
- the user explicitly requests suggestions


Suggestion Pipeline:

User Action  
↓  
Collect Context  
↓  
Graph Expansion (1–2 hop)  
↓  
Vector Search (Evidence Retrieval)  
↓  
Context Bundle Creation  
↓  
LLM Suggestion Generation


Example Suggestion Output:

```json
{
  "suggestion_type": "ADD_RELATION",
  "relation": {
    "type": "ALLY_OF",
    "from": "Kai",
    "to": "Luna",
    "confidence": 0.82
  },
  "evidence_refs": ["EV_8841"],
  "reason_summary": "Both characters participated in the same battle."
}
```


---

# 6. Human-in-the-loop Validation

Users review AI suggestions before they are applied.

Possible actions:

| Action | Result |
|---|---|
| Accept | relation is created |
| Edit | user modifies suggestion |
| Reject | suggestion dismissed |


Decision Flow:

AI Suggestion  
↓  
User Review  
↓  
Accept / Edit / Reject  
↓  
Graph Update


---

# 7. UI Layout Specification

Main screen layout:

Top Bar  
-------------------------------------

Left Panel | Graph Area | Right Panel  
           |            |  
           |            | AI Suggestion Panel  


Top Bar Components:

- global search
- entity type filter
- version selector
- create node button


Left Panel:

- entity explorer
- type filters
- recent edits
- suggestion queue


Graph Area:

- node click → open detail panel
- relation click → show relation info
- right click → create relation
- zoom and pan


Right Panel (Detail Panel):

Node view:

- entity attributes
- connected relations
- request AI suggestion

Relation view:

- relation type
- validity period
- evidence references


AI Suggestion Panel:

- suggestion summary
- confidence score
- evidence highlight
- Accept / Edit / Reject buttons


---

# 8. Technology Stack

| Layer | Technology |
|---|---|
| Graph Database | Neo4j |
| Vector Database | Qdrant |
| AI Framework | LangChain |
| Frontend | React |


Neo4j:

- relationship-focused database
- optimized graph traversal


Qdrant:

- vector similarity search
- metadata filtering


LangChain:

- pipeline orchestration
- structured LLM output


React:

- component-based UI
- async interaction with AI


---

# 9. Design Principles

Evidence-first Knowledge  
All semantic relations must reference supporting evidence.

Human-in-the-loop  
AI suggestions are never automatically applied.

Graph-native Modeling  
Entities and relations are modeled explicitly.

Separation of Structure and Meaning  

Structural edges → stable state  
Semantic relations → interpretable claims


---

# 10. Expected Capabilities

The system enables:

- visual exploration of knowledge graphs
- AI-assisted relation discovery
- evidence-backed knowledge verification
- iterative context evolution
