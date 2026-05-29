import { Workbook } from 'exceljs';
import type { ReportTable } from '../data/report-table';

export async function writeXlsx(
  title: string,
  table: ReportTable,
): Promise<Buffer> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Звіт');

  const titleRow = sheet.addRow([title]);
  titleRow.font = { bold: true, size: 14 };
  sheet.addRow([]);

  const header = sheet.addRow(table.columns);
  header.font = { bold: true };
  for (const row of table.rows) {
    sheet.addRow(row);
  }
  table.columns.forEach((_, index) => {
    sheet.getColumn(index + 1).width = 28;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
