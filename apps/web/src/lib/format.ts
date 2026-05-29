const numberFormat = new Intl.NumberFormat('uk-UA')

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatMoney(value: number, sign = '₴'): string {
  return `${numberFormat.format(value)} ${sign}`
}

const compactMln = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 })
const compactTys = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 })

export function formatCompactUAH(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${compactMln.format(value / 1_000_000)} млн ₴`
  if (abs >= 1_000) return `${compactTys.format(value / 1_000)} тис ₴`
  return `${numberFormat.format(value)} ₴`
}
