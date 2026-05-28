import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: ReactNode
  hint?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__title">{title}</div>
      {hint && <div>{hint}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
