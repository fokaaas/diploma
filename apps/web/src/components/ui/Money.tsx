import { formatMoney } from '../../lib/format'

interface MoneyProps {
  value: number | null | undefined
  sign?: string
}

export function Money({ value, sign = '₴' }: MoneyProps) {
  if (value == null || value === 0) return <span className="muted">—</span>
  return <span className="tabular">{formatMoney(value, sign)}</span>
}
