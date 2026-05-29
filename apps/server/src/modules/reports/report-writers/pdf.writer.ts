import PDFDocument from 'pdfkit';
import type { ReportTable } from '../data/report-table';

const FONT_PATH =
  require.resolve('@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf');

const ROW_HEIGHT = 18;

export function writePdf(title: string, table: ReportTable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('main', FONT_PATH);
    doc.font('main');

    const left = doc.page.margins.left;
    const usable =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = usable / table.columns.length;
    const bottom = doc.page.height - doc.page.margins.bottom;

    doc.fontSize(16).text(title, left, doc.page.margins.top);
    let y = doc.y + 8;

    const writeRow = (cells: (string | number)[], size: number): void => {
      if (y + ROW_HEIGHT > bottom) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      doc.fontSize(size);
      cells.forEach((cell, index) => {
        doc.text(String(cell), left + index * colWidth, y, {
          width: colWidth - 6,
          ellipsis: true,
          lineBreak: false,
        });
      });
      y += ROW_HEIGHT;
    };

    writeRow(table.columns, 10);
    doc
      .moveTo(left, y - 4)
      .lineTo(left + usable, y - 4)
      .stroke();
    table.rows.forEach((row) => writeRow(row, 9));

    doc.end();
  });
}
