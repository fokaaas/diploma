import type { ReportTable } from '../data/report-table';
import { writeCsv } from './csv.writer';
import { writeXlsx } from './xlsx.writer';
import { writePdf } from './pdf.writer';

export type ExportFormat = 'XLSX' | 'PDF' | 'CSV';

export interface RenderedReport {
  buffer: Buffer;
  mimeType: string;
  ext: string;
}

export async function writeReport(
  format: ExportFormat,
  title: string,
  table: ReportTable,
): Promise<RenderedReport> {
  if (format === 'CSV') {
    return { buffer: writeCsv(table), mimeType: 'text/csv', ext: 'csv' };
  }
  if (format === 'XLSX') {
    return {
      buffer: await writeXlsx(title, table),
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ext: 'xlsx',
    };
  }
  return {
    buffer: await writePdf(title, table),
    mimeType: 'application/pdf',
    ext: 'pdf',
  };
}
