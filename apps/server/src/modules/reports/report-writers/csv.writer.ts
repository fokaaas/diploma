import type { ReportTable } from '../data/report-table';

const BOM = '﻿';

function escape(value: string | number): string {
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function writeCsv(table: ReportTable): Buffer {
  const lines = [table.columns, ...table.rows].map((row) =>
    row.map(escape).join(','),
  );
  return Buffer.from(BOM + lines.join('\r\n'), 'utf-8');
}
