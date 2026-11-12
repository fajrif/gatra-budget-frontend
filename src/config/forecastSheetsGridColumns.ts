import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer, CurrencyCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import { bulanLabel } from '@/utils/forecast';
import { formatDate, formatRupiah } from '@/utils/formatters';
import type { ForecastSheetListItem } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

const selisihOf = (row?: ForecastSheetListItem) => (row ? row.total_pemasukan - row.total_pengeluaran : 0);

export const createForecastSheetsColumnDefs = ({
  onEdit,
  onDelete,
  onView,
}: GridActionHandlers<ForecastSheetListItem>): ColDef<ForecastSheetListItem>[] => [
  {
    field: 'nama',
    headerName: 'Nama Sheet',
    minWidth: 220,
    cellStyle: { fontWeight: 600, cursor: 'pointer' },
  },
  {
    field: 'bulan',
    headerName: 'Periode',
    valueFormatter: (p) => bulanLabel(p.value ?? ''),
  },
  { field: 'saldo', headerName: 'Saldo', cellRenderer: CurrencyCellRenderer },
  { field: 'total_pengeluaran', headerName: 'Total Pengeluaran', cellRenderer: CurrencyCellRenderer },
  {
    field: 'total_pemasukan',
    headerName: 'Total Pemasukan',
    cellRenderer: CurrencyCellRenderer,
  },
  {
    field: 'jumlah_invoice',
    headerName: 'Tagihan Dicentang',
    width: 140,
    type: 'rightAligned',
  },
  {
    headerName: 'Selisih (+/−)',
    valueGetter: (p) => selisihOf(p.data),
    valueFormatter: (p) => `${p.value > 0 ? '+' : ''}${formatRupiah(p.value)}`,
    cellClass: (p) => (p.value >= 0 ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'),
  },
  {
    field: 'updated_at',
    headerName: 'Terakhir Diubah',
    valueFormatter: (p) => formatDate(p.value),
  },
  {
    headerName: 'Aksi',
    width: 60,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ActionMenuCellRenderer,
    cellRendererParams: { onView, onEdit, onDelete },
  },
];
