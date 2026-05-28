const numberFormat = new Intl.NumberFormat('uk-UA')

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatMoney(value: number, sign = '₴'): string {
  return `${numberFormat.format(value)} ${sign}`
}
