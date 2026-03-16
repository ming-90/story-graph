# StoryGraph — Context Layer Editor

AI 시스템이 사용하는 구조화된 지식을 관리하기 위한 **Context Layer Editor**입니다.  
그래프 기반 지식 구조를 시각화하고, AI가 제안한 관계를 인간이 검토·승인하는 Human-in-the-loop 워크플로우를 제공합니다.

---

## 주요 기능

- **그래프 시각화** — Entity와 Relation을 인터랙티브 그래프로 탐색
- **Entity 관리** — Character, Faction, Event, Item, Location, Concept 생성·편집·삭제
- **Relation 관리** — Semantic Relation(ALLY_OF, ENEMY_OF 등)과 Structural Edge(belongs_to, owns 등) 관리
- **Evidence 연결** — 관계를 뒷받침하는 문서 증거 참조
- **AI Suggestion 패널** — AI가 제안한 관계를 Accept / Edit / Reject로 검토
- **완전 로컬 동작** — SQLite 내장 DB로 외부 서버 없이 실행

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 앱 프레임워크 | Electron + electron-vite |
| UI | React 18 + TypeScript |
| 로컬 DB | SQLite (better-sqlite3) |
| 그래프 시각화 | @xyflow/react (React Flow) |
| 상태 관리 | Zustand |
| 스타일 | Tailwind CSS |

---

## 아키텍처

```
Source Layer
    ↓
Evidence Layer  (Vector DB — Qdrant, 향후 연동)
    ↓
Entity Layer    (SQLite — entities 테이블)
    ↓
Relation Layer  (SQLite — relations 테이블)
    ↓
State Layer     (SQLite — structural_edges 테이블)
```

### Electron 프로세스 구조

```
Main Process (Node.js)
  ├── SQLite DB (better-sqlite3)
  │     ├── entities
  │     ├── relations
  │     ├── structural_edges
  │     ├── evidence
  │     └── suggestions
  └── IPC Handlers

Preload (contextBridge)
  └── window.api  ← renderer에서 접근하는 타입 안전 IPC 브릿지

Renderer (React)
  ├── Zustand Store
  ├── React Flow (GraphCanvas)
  ├── TopBar / LeftPanel / RightPanel
  └── AISuggestionPanel
```

---

## 프로젝트 구조

```
story-graph/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts             # 앱 진입점
│   │   ├── ipc.ts               # IPC 핸들러
│   │   └── db/
│   │       ├── index.ts         # DB 초기화
│   │       ├── schema.ts        # SQLite 스키마
│   │       ├── entities.ts
│   │       ├── relations.ts
│   │       ├── evidence.ts
│   │       └── suggestions.ts
│   ├── preload/
│   │   └── index.ts             # IPC Bridge
│   ├── shared/
│   │   └── types.ts             # 공유 타입 정의
│   └── renderer/                # React 앱
│       └── src/
│           ├── App.tsx
│           ├── store/useStore.ts
│           ├── components/
│           │   ├── TopBar.tsx
│           │   ├── LeftPanel.tsx
│           │   ├── GraphCanvas.tsx
│           │   ├── RightPanel.tsx
│           │   ├── AISuggestionPanel.tsx
│           │   ├── nodes/EntityNode.tsx
│           │   ├── panels/EntityDetail.tsx
│           │   ├── panels/RelationDetail.tsx
│           │   └── modals/
│           └── utils/graphTransform.ts
├── CONFIG.md                    # 상세 스펙 문서
├── electron.vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 시작하기

### 요구 사항

- Node.js 18+
- macOS / Windows / Linux

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 프로덕션 빌드
npm run build

# 패키징 (배포용)
npm run dist
```

### DB 저장 위치

SQLite 파일은 OS의 앱 데이터 경로에 자동 생성됩니다.

| OS | 경로 |
|---|---|
| macOS | `~/Library/Application Support/StoryGraph/storygraph.db` |
| Windows | `%APPDATA%\StoryGraph\storygraph.db` |
| Linux | `~/.config/StoryGraph/storygraph.db` |

---

## UI 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  TopBar: 검색 / 타입 필터 / + Entity / + Relation        │
├──────────┬──────────────────────────┬────────┬──────────┤
│          │                          │        │          │
│  Left    │     Graph Canvas         │ Right  │   AI     │
│  Panel   │   (React Flow)           │ Panel  │ Suggest  │
│          │                          │        │  Panel   │
│ Entity   │  노드 클릭 → 우측 패널   │ Entity │          │
│ Explorer │  엣지 클릭 → 관계 상세   │ Detail │ Accept / │
│ Filters  │  우클릭 → 관계 생성      │        │ Edit /   │
│ Queue    │  Zoom / Pan              │        │ Reject   │
└──────────┴──────────────────────────┴────────┴──────────┘
```

---

## 데이터 모델

### Entity

```json
{
  "id": "CHAR_A1B2C3D4",
  "type": "Character",
  "name": "Kai",
  "attributes": { "role": "Mercenary", "status": "active" }
}
```

### Semantic Relation

```json
{
  "id": "REL_E5F6G7H8",
  "type": "ALLY_OF",
  "from": "CHAR_A1B2C3D4",
  "to": "CHAR_I9J0K1L2",
  "confidence": 0.82,
  "status": "proposed",
  "supportedBy": ["EV_M3N4O5P6"]
}
```

### Relation 상태 흐름

```
proposed  →  verified
          →  rejected
```

---

## 향후 연동 계획

- [ ] **Qdrant** 벡터 DB 연동 (Evidence 임베딩 검색)
- [ ] **Neo4j** 그래프 DB 마이그레이션 (대규모 그래프)
- [ ] **LangChain** AI Suggestion 파이프라인
- [ ] Evidence 문서 임포트 (PDF, Markdown)
- [ ] 버전 히스토리 / 되돌리기
