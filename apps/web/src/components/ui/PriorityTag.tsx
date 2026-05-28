import type { Priority } from '../../types/domain'

const PRIORITY_MAP: Record<Priority, { cls: string; label: string }> = {
  high: { cls: 'priority-dot--high', label: 'Висока' },
  med: { cls: 'priority-dot--med', label: 'Середня' },
  low: { cls: 'priority-dot--low', label: 'Низька' },
}

export function PriorityTag({ value }: { value: Priority }) {
  const { cls, label } = PRIORITY_MAP[value]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-sm)' }}>
      <span className={`priority-dot ${cls}`} />
      {label}
    </span>
  )
}
