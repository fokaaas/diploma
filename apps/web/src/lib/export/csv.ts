type CsvCell = string | number | null | undefined

const BOM = '﻿'

function escapeCell(value: CsvCell): string {
  const text = value == null ? '' : String(value)
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvCell[][],
): void {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','))
  // BOM so Excel reads UTF-8 (Cyrillic) correctly.
  const blob = new Blob([BOM, lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
