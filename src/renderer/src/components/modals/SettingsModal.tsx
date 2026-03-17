import { useState } from 'react'

interface SettingsModalProps {
  onClose: () => void
}

type SettingSection = 'general' | 'graph' | 'database' | 'ai' | 'shortcuts'

const MENU_ITEMS: { id: SettingSection; label: string; icon: React.ReactNode }[] = [
  {
    id: 'general',
    label: '일반',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    id: 'graph',
    label: '그래프',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    )
  },
  {
    id: 'database',
    label: '데이터베이스',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    )
  },
  {
    id: 'ai',
    label: 'AI',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    )
  },
  {
    id: 'shortcuts',
    label: '단축키',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    )
  }
]

// ─── Section Components ────────────────────────────────────────────────────────

function Toggle({ checked }: { checked?: boolean }) {
  const [on, setOn] = useState(checked ?? false)
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
        on ? 'bg-graph-accent' : 'bg-graph-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function SettingRow({
  label,
  description,
  children
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-graph-border last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm text-graph-text">{label}</p>
        {description && <p className="text-xs text-graph-muted mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-graph-muted uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</h3>
}

function GeneralSettings() {
  return (
    <div>
      <SectionTitle>화면</SectionTitle>
      <SettingRow label="테마" description="앱 전체 색상 테마">
        <select className="input text-xs h-7 w-28">
          <option>다크</option>
          <option>라이트</option>
          <option>시스템 따름</option>
        </select>
      </SettingRow>
      <SettingRow label="언어" description="UI 표시 언어">
        <select className="input text-xs h-7 w-28">
          <option>한국어</option>
          <option>English</option>
        </select>
      </SettingRow>
      <SettingRow label="폰트 크기" description="에디터 및 패널 폰트 크기">
        <select className="input text-xs h-7 w-28">
          <option>작게</option>
          <option>보통</option>
          <option>크게</option>
        </select>
      </SettingRow>

      <SectionTitle>동작</SectionTitle>
      <SettingRow label="자동 저장" description="변경사항을 즉시 저장">
        <Toggle checked />
      </SettingRow>
      <SettingRow label="실행 취소 기록" description="최대 되돌리기 횟수">
        <select className="input text-xs h-7 w-28">
          <option>20회</option>
          <option>50회</option>
          <option>100회</option>
        </select>
      </SettingRow>
      <SettingRow label="시작 시 마지막 프로젝트 열기" description="앱 실행 시 이전 상태 복원">
        <Toggle checked />
      </SettingRow>
    </div>
  )
}

function GraphSettings() {
  return (
    <div>
      <SectionTitle>노드</SectionTitle>
      <SettingRow label="노드 크기" description="그래프 노드의 기본 크기">
        <select className="input text-xs h-7 w-28">
          <option>작게</option>
          <option>보통</option>
          <option>크게</option>
        </select>
      </SettingRow>
      <SettingRow label="노드 라벨 표시" description="노드 이름 항상 보이기">
        <Toggle checked />
      </SettingRow>
      <SettingRow label="타입 아이콘 표시" description="노드에 엔티티 타입 아이콘 표시">
        <Toggle checked />
      </SettingRow>

      <SectionTitle>엣지</SectionTitle>
      <SettingRow label="엣지 스타일" description="관계선 모양">
        <select className="input text-xs h-7 w-28">
          <option>곡선</option>
          <option>직선</option>
          <option>꺾인선</option>
        </select>
      </SettingRow>
      <SettingRow label="엣지 라벨 표시" description="관계 타입 이름 표시">
        <Toggle />
      </SettingRow>
      <SettingRow label="구조적 엣지 기본 표시" description="계층 관계선을 기본으로 보이기">
        <Toggle />
      </SettingRow>

      <SectionTitle>레이아웃</SectionTitle>
      <SettingRow label="기본 레이아웃" description="그래프 초기 배치 방식">
        <select className="input text-xs h-7 w-28">
          <option>자동 배치</option>
          <option>방사형</option>
          <option>계층형</option>
          <option>자유</option>
        </select>
      </SettingRow>
      <SettingRow label="새 노드 위치" description="엔티티 생성 시 노드 위치">
        <select className="input text-xs h-7 w-28">
          <option>화면 중앙</option>
          <option>랜덤</option>
          <option>마지막 위치</option>
        </select>
      </SettingRow>
    </div>
  )
}

function DatabaseSettings() {
  return (
    <div>
      <SectionTitle>저장 위치</SectionTitle>
      <SettingRow label="데이터베이스 경로" description="SQLite 파일 저장 위치">
        <div className="flex gap-1">
          <input
            className="input text-xs h-7 w-44"
            defaultValue="~/Library/Application Support/StoryGraph/storygraph.db"
            readOnly
          />
          <button className="btn-ghost text-xs h-7 px-2">변경</button>
        </div>
      </SettingRow>

      <SectionTitle>백업</SectionTitle>
      <SettingRow label="자동 백업" description="주기적으로 DB를 백업">
        <Toggle checked />
      </SettingRow>
      <SettingRow label="백업 주기" description="">
        <select className="input text-xs h-7 w-28">
          <option>매일</option>
          <option>매주</option>
          <option>매월</option>
        </select>
      </SettingRow>
      <SettingRow label="백업 보관 개수" description="최대 보관할 백업 파일 수">
        <select className="input text-xs h-7 w-28">
          <option>3개</option>
          <option>7개</option>
          <option>30개</option>
        </select>
      </SettingRow>

      <SectionTitle>관리</SectionTitle>
      <div className="flex gap-2 mt-1">
        <button className="btn-ghost text-xs h-7">지금 백업</button>
        <button className="btn-ghost text-xs h-7">백업에서 복원...</button>
        <button className="btn-danger text-xs h-7">전체 데이터 초기화</button>
      </div>
    </div>
  )
}

function AISettings() {
  return (
    <div>
      <SectionTitle>API 연결</SectionTitle>
      <SettingRow label="OpenAI API 키" description="GPT 모델 사용을 위한 API 키">
        <div className="flex gap-1">
          <input
            type="password"
            className="input text-xs h-7 w-44"
            placeholder="sk-..."
          />
          <button className="btn-ghost text-xs h-7 px-2">저장</button>
        </div>
      </SettingRow>
      <SettingRow label="모델 선택" description="사용할 언어 모델">
        <select className="input text-xs h-7 w-36">
          <option>gpt-4o</option>
          <option>gpt-4o-mini</option>
          <option>gpt-4-turbo</option>
          <option>gpt-3.5-turbo</option>
        </select>
      </SettingRow>

      <SectionTitle>제안 기능</SectionTitle>
      <SettingRow label="AI 관계 제안" description="엔티티 추가 시 자동으로 관계 제안">
        <Toggle />
      </SettingRow>
      <SettingRow label="제안 신뢰도 임계값" description="이 값 이상의 제안만 표시 (0~1)">
        <input
          type="number"
          className="input text-xs h-7 w-20"
          defaultValue={0.6}
          min={0}
          max={1}
          step={0.1}
        />
      </SettingRow>
      <SettingRow label="시나리오 자동 분석" description="시나리오 저장 시 엔티티 자동 추출">
        <Toggle />
      </SettingRow>

      <SectionTitle>벡터 검색</SectionTitle>
      <SettingRow label="임베딩 모델" description="유사 엔티티 검색에 사용할 모델">
        <select className="input text-xs h-7 w-36">
          <option>text-embedding-3-small</option>
          <option>text-embedding-3-large</option>
          <option>text-embedding-ada-002</option>
        </select>
      </SettingRow>
      <SettingRow label="벡터 DB 연동" description="Qdrant 서버 주소">
        <input
          className="input text-xs h-7 w-44"
          placeholder="http://localhost:6333"
        />
      </SettingRow>
    </div>
  )
}

const SHORTCUT_LIST = [
  { action: '새 엔티티 생성', key: '⌘ N' },
  { action: '새 관계 생성', key: '⌘ R' },
  { action: '시나리오 패널 열기', key: '⌘ S' },
  { action: '설정 열기', key: '⌘ ,'},
  { action: '검색', key: '⌘ F' },
  { action: '선택 삭제', key: '⌫' },
  { action: '전체 선택', key: '⌘ A' },
  { action: '실행 취소', key: '⌘ Z' },
  { action: '다시 실행', key: '⌘ ⇧ Z' },
  { action: '그래프 맞추기', key: '⌘ ⇧ F' },
  { action: '확대', key: '⌘ +' },
  { action: '축소', key: '⌘ -' },
  { action: '패널 닫기', key: 'Esc' },
]

function ShortcutsSettings() {
  return (
    <div>
      <SectionTitle>키보드 단축키</SectionTitle>
      <p className="text-xs text-graph-muted mb-3">단축키 편집은 추후 지원 예정입니다.</p>
      <div className="space-y-0.5">
        {SHORTCUT_LIST.map(({ action, key }) => (
          <div
            key={action}
            className="flex items-center justify-between py-2 px-2 rounded hover:bg-graph-border/30 group"
          >
            <span className="text-sm text-graph-text">{action}</span>
            <kbd className="px-2 py-0.5 rounded bg-graph-border text-xs text-graph-muted font-mono border border-graph-border/50">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  )
}

const SECTION_MAP: Record<SettingSection, React.ReactNode> = {
  general: <GeneralSettings />,
  graph: <GraphSettings />,
  database: <DatabaseSettings />,
  ai: <AISettings />,
  shortcuts: <ShortcutsSettings />
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [active, setActive] = useState<SettingSection>('general')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="panel flex w-[780px] h-[540px] rounded-xl overflow-hidden shadow-2xl border border-graph-border">
        {/* Left menu */}
        <aside className="w-48 shrink-0 border-r border-graph-border bg-graph-bg flex flex-col">
          <div className="px-4 pt-5 pb-3">
            <p className="text-xs font-semibold text-graph-muted uppercase tracking-wider">설정</p>
          </div>
          <nav className="flex-1 px-2 space-y-0.5">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  active === item.id
                    ? 'bg-graph-accent/15 text-graph-accent'
                    : 'text-graph-muted hover:bg-graph-border/50 hover:text-graph-text'
                }`}
              >
                <span className={active === item.id ? 'text-graph-accent' : ''}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-graph-border">
            <p className="text-[10px] text-graph-muted text-center">StoryGraph v1.0.0</p>
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-graph-border shrink-0">
            <h2 className="text-sm font-semibold text-graph-text">
              {MENU_ITEMS.find((m) => m.id === active)?.label}
            </h2>
            <button
              onClick={onClose}
              className="text-graph-muted hover:text-graph-text transition-colors p-1 rounded hover:bg-graph-border/50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {SECTION_MAP[active]}
          </div>

          <div className="px-6 py-3 border-t border-graph-border shrink-0 flex justify-end gap-2">
            <p className="flex-1 text-xs text-graph-muted self-center">* 설정은 현재 적용되지 않습니다</p>
            <button onClick={onClose} className="btn-ghost text-xs h-7">닫기</button>
            <button className="btn-primary text-xs h-7" disabled>저장</button>
          </div>
        </div>
      </div>
    </div>
  )
}
