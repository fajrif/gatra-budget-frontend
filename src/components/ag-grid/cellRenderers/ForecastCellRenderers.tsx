import type { ICellRendererParams } from 'ag-grid-community';
import type { ForecastExpenseRow } from '@/utils/forecast';
import type { Invoice } from '@/types';

/** What the expense grid reads from its `context` prop. */
export interface ForecastExpenseContext {
  bulan: string;
  onDelete: (rid: string) => void;
}

/** What the invoice grid reads from its `context` prop. */
export interface ForecastInvoiceContext {
  selectedIds: ReadonlySet<string>;
  onToggle: (id: string, checked: boolean) => void;
}

export const ForecastDeleteCellRenderer = (p: ICellRendererParams<ForecastExpenseRow, unknown, ForecastExpenseContext>) => (
  <button
    type="button"
    className="text-slate-400 hover:text-red-600 text-base leading-none px-1"
    title="Hapus baris"
    aria-label="Hapus baris"
    onClick={() => p.data && p.context.onDelete(p.data.rid)}
  >
    ×
  </button>
);

export const ForecastTickCellRenderer = (p: ICellRendererParams<Invoice, unknown, ForecastInvoiceContext>) => {
  if (!p.data) return null;
  const { id, no_invoice, status } = p.data;
  // Paid (Kliring) invoices are shown for information only and never counted.
  if (status !== 'Submit') {
    return <span className="text-slate-300" title="Sudah dibayar: info saja, tidak dihitung">–</span>;
  }
  return (
    <input
      type="checkbox"
      className="h-4 w-4 cursor-pointer accent-blue-900"
      aria-label={`Masukkan ${no_invoice} ke total pemasukan`}
      checked={p.context.selectedIds.has(id)}
      onChange={(e) => p.context.onToggle(id, e.target.checked)}
    />
  );
};

