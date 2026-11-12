import { MONITORING_MONTH_NAMES } from '@/utils/invoiceMonitoring';
import type { Invoice } from '@/types';

/** One editable expense line in the Forecast Kas grid (client-side only until saved). */
export interface ForecastExpenseRow {
  /** Local row id; the server assigns the real ids on save. */
  rid: string;
  item: string;
  /** YYYY-MM-DD, or '' while still empty. */
  tanggal: string;
  /** null while still empty. */
  jumlah: number | null;
}

export interface ForecastSummary {
  saldo: number;
  totalPengeluaran: number;
  totalPemasukan: number;
  /** pemasukan - pengeluaran; positive means more comes in than goes out. */
  selisih: number;
  /** saldo + selisih */
  saldoAkhir: number;
  invoiceCount: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-10" -> first and last day of that month as YYYY-MM-DD. */
export const monthBounds = (bulan: string): { min: string; max: string } => {
  const [y, m] = bulan.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return { min: `${y}-${pad(m)}-01`, max: `${y}-${pad(m)}-${pad(lastDay)}` };
};

export const isDateInMonth = (tanggal: string, bulan: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(tanggal) && tanggal.slice(0, 7) === bulan;

/** "2026-10" -> "Oktober 2026". */
export const bulanLabel = (bulan: string): string => {
  const [y, m] = bulan.split('-');
  const name = MONITORING_MONTH_NAMES[Number(m) - 1];
  return name && y ? `${name} ${y}` : bulan;
};

/** Suggested name for a new sheet, e.g. "Perkiraan Okt, 2026". */
export const defaultSheetName = (bulan: string): string => {
  const [y, m] = bulan.split('-');
  const name = MONITORING_MONTH_NAMES[Number(m) - 1]?.slice(0, 3);
  return name && y ? `Perkiraan ${name}, ${y}` : 'Perkiraan';
};

/** Why an expense row cannot be saved, or null when it is fine. */
export const expenseRowError = (row: ForecastExpenseRow, bulan: string): string | null => {
  if (!row.item.trim()) return 'Item wajib diisi';
  if (!row.tanggal) return 'Tanggal wajib diisi';
  if (!isDateInMonth(row.tanggal, bulan)) return `Tanggal harus di ${bulanLabel(bulan)}`;
  if (!row.jumlah || row.jumlah <= 0) return 'Nilai harus lebih dari 0';
  return null;
};

/** First problem across all rows, with its 1-based row number, or null. */
export const firstExpenseError = (rows: ForecastExpenseRow[], bulan: string): string | null => {
  for (let i = 0; i < rows.length; i++) {
    const err = expenseRowError(rows[i], bulan);
    if (err) return `Pengeluaran baris ${i + 1}: ${err}`;
  }
  return null;
};

/**
 * Totals of a sheet. Only ticked invoices that are still unpaid (Submit) count
 * as income: paid ones are already part of the balance.
 */
export const computeForecastSummary = (
  saldo: number,
  expenses: ForecastExpenseRow[],
  invoices: Pick<Invoice, 'id' | 'nilai' | 'status'>[],
  selectedIds: ReadonlySet<string>,
): ForecastSummary => {
  const totalPengeluaran = expenses.reduce((sum, e) => sum + (e.jumlah && e.jumlah > 0 ? e.jumlah : 0), 0);
  const counted = invoices.filter((i) => i.status === 'Submit' && selectedIds.has(i.id));
  const totalPemasukan = counted.reduce((sum, i) => sum + i.nilai, 0);
  const selisih = totalPemasukan - totalPengeluaran;
  return {
    saldo,
    totalPengeluaran,
    totalPemasukan,
    selisih,
    saldoAkhir: saldo + selisih,
    invoiceCount: counted.length,
  };
};
