import type { EntityType, RelationStatus, SuggestionStatus } from '../../../../shared/types'

export const RELATION_TYPE_KO: Record<string, string> = {
  ALLY_OF: '동맹',
  ENEMY_OF: '적대',
  CAUSED_BY: '원인',
  CONTRACT_WITH: '계약',
  KNOWS: '알고 있음',
  MEMBER_OF: '소속',
  OWNS: '소유',
  LEADS: '이끔',
  BETRAYED_BY: '배신',
  LOVES: '사랑',
  HATES: '증오',
  CREATED_BY: '창조',
  LOCATED_IN: '위치',
  RELATED_TO: '관련',
}

export function toRelationTypeKo(type: string): string {
  return RELATION_TYPE_KO[type] ?? type
}

const TYPE_CLASS: Record<EntityType, string> = {
  Character: 'tag-character',
  Faction: 'tag-faction',
  Event: 'tag-event',
  Item: 'tag-item',
  Location: 'tag-location',
  Concept: 'tag-concept',
  Evidence: 'tag-evidence'
}

const TYPE_KO: Record<EntityType, string> = {
  Character: '캐릭터',
  Faction: '세력',
  Event: '사건',
  Item: '아이템',
  Location: '장소',
  Concept: '개념',
  Evidence: '근거'
}

const STATUS_KO: Record<string, string> = {
  proposed: '제안됨',
  verified: '검증됨',
  rejected: '거절됨',
  pending: '대기중',
  accepted: '수락됨'
}

const TYPE_COLOR: Record<EntityType, string> = {
  Character: '#6366f1',
  Faction: '#f59e0b',
  Event: '#10b981',
  Item: '#3b82f6',
  Location: '#ec4899',
  Concept: '#8b5cf6',
  Evidence: '#94a3b8'
}

interface EntityTypeBadgeProps {
  type: EntityType | string
  dot?: boolean
}

export function EntityTypeBadge({ type, dot }: EntityTypeBadgeProps) {
  const cls = TYPE_CLASS[type as EntityType] ?? 'tag-evidence'
  const color = TYPE_COLOR[type as EntityType] ?? '#94a3b8'

  if (dot) {
    return (
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
    )
  }

  return <span className={`badge ${cls}`}>{TYPE_KO[type as EntityType] ?? type}</span>
}

export function StatusBadge({ status }: { status: RelationStatus | SuggestionStatus }) {
  return <span className={`badge status-${status}`}>{STATUS_KO[status] ?? status}</span>
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color =
    value >= 0.8 ? '#10b981' : value >= 0.5 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-graph-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-graph-muted w-8 text-right">{pct}%</span>
    </div>
  )
}
