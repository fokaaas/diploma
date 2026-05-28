import type { ReactNode } from 'react'
import type { BadgeVariant, StatusMeta } from '../../types/domain'

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}

interface StatusBadgeProps<K extends string> {
  status: K
  statuses: Record<K, StatusMeta<K>>
}

export function StatusBadge<K extends string>({ status, statuses }: StatusBadgeProps<K>) {
  const meta = statuses[status]
  return <span className={`badge badge--${meta.badge}`}>{meta.label}</span>
}
