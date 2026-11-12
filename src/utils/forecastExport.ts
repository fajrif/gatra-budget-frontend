import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { bulanLabel, type ForecastExpenseRow, type ForecastSummary } from '@/utils/forecast';
import { toDMY } from '@/utils/invoiceMonitoring';

/** Everything a Forecast Kas report shows; shared by the Excel and PDF exports. */
export interface ForecastReportData {
  nama: string;
  /** YYYY-MM */
  bulan: string;
  /** Expenses sorted by date; only valid rows. */
  expenses: ForecastExpenseRow[];
  /** Ticked, still unpaid invoices. */
  invoices: { no_invoice: string; nama_invoice: string; tgl_tagihan: string; status: string; nilai: number }[];
  summary: ForecastSummary;
}

const RUPIAH = '"Rp" #,##0;[Red]-"Rp" #,##0';
const GREEN = 'FF15803D';
const RED = 'FFDC2626';

/**
 * One worksheet, top to bottom: sheet info, Pengeluaran, Pemasukan (ticked
 * invoices), Ringkasan. All money sits in column E.
 */
export const exportForecastToExcel = async (data: ForecastReportData, filename: string): Promise<void> => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Forecast Kas');
  ws.columns = [{ width: 30 }, { width: 38 }, { width: 14 }, { width: 12 }, { width: 22 }];

  const bold = (row: ExcelJS.Row) => {
    row.eachCell({ includeEmpty: false }, (c) => (c.font = { ...c.font, bold: true }));
  };
  const band = (text: string) => {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, 5);
    row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  };
  const header = (labels: string[]) => {
    const row = ws.addRow(labels);
    row.eachCell({ includeEmpty: true }, (c) => {
      c.font = { bold: true };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
    });
  };
  const money = (row: ExcelJS.Row, value: number, argb?: string) => {
    const cell = row.getCell(5);
    cell.value = value;
    cell.numFmt = RUPIAH;
    if (argb) cell.font = { ...cell.font, color: { argb } };
  };

  const title = ws.addRow([`Forecast Kas - ${data.nama}`]);
  title.getCell(1).font = { bold: true, size: 14 };
  ws.addRow(['Periode', bulanLabel(data.bulan)]);
  const saldoRow = ws.addRow(['Saldo']);
  money(saldoRow, data.summary.saldo);
  ws.addRow([]);

  band('PENGELUARAN');
  header(['Item', 'Tgl', '', '', 'Nilai']);
  data.expenses.forEach((e) => {
    const row = ws.addRow([e.item, toDMY(e.tanggal)]);
    money(row, e.jumlah ?? 0);
  });
  const totalOut = ws.addRow(['Total Pengeluaran']);
  money(totalOut, data.summary.totalPengeluaran);
  bold(totalOut);
  ws.addRow([]);

  band('PEMASUKAN (tagihan belum dibayar yang dicentang)');
  header(['No. Invoice', 'Nama Invoice', 'Tgl Submit', 'Status', 'Nilai Tagihan']);
  data.invoices.forEach((i) => {
    const row = ws.addRow([i.no_invoice, i.nama_invoice, toDMY(i.tgl_tagihan), i.status]);
    money(row, i.nilai);
  });
  const totalIn = ws.addRow(['Total Pemasukan']);
  money(totalIn, data.summary.totalPemasukan);
  bold(totalIn);
  ws.addRow([]);

  band('RINGKASAN');
  const lines: [string, number, string?][] = [
    ['Saldo', data.summary.saldo],
    ['Total Pengeluaran', data.summary.totalPengeluaran],
    ['Total Pemasukan', data.summary.totalPemasukan],
    ['Selisih (+/-)', data.summary.selisih, data.summary.selisih >= 0 ? GREEN : RED],
    ['Saldo Akhir Perkiraan', data.summary.saldoAkhir, data.summary.saldoAkhir >= 0 ? GREEN : RED],
  ];
  lines.forEach(([label, value, color]) => {
    const row = ws.addRow([label]);
    money(row, value, color);
    if (label.startsWith('Selisih') || label.startsWith('Saldo Akhir')) bold(row);
  });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    filename,
  );
};
