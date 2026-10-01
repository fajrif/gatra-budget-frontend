import type { ICellRendererParams } from 'ag-grid-community';
import { formatRupiah } from '@/utils/formatters';

const CurrencyCellRenderer = ({ value }: ICellRendererParams<unknown, number | string | null>) => {
  if (value === undefined || value === null) {
    return <span className="text-slate-400">Rp 0</span>;
  }

  return <span>{formatRupiah(value)}</span>;
};

export default CurrencyCellRenderer;