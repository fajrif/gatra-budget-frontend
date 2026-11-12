import type { ColDef } from 'ag-grid-community';
import { BadgeCellRenderer, CurrencyCellRenderer } from '@/components/ag-grid/cellRenderers';
import {
  ForecastDeleteCellRenderer,
  ForecastTickCellRenderer,
  type ForecastExpenseContext,
} from '@/components/ag-grid/cellRenderers/ForecastCellRenderers';
import { invoiceStatusBadgeClasses } from '@/config/invoicesGridColumns';
import { formatDate, formatRupiah } from '@/utils/formatters';
import { expenseRowError, monthBounds, type ForecastExpenseRow } from '@/utils/forecast';
import type { Invoice } from '@/types';

const invalid = (field: 'item' | 'tanggal' | 'jumlah') => (p: { data?: ForecastExpenseRow; context: ForecastExpenseContext }) => {
  if (!p.data) return false;
  const err = expenseRowError(p.data, p.context.bulan);
  if (!err) return false;
  if (field === 'item') return !p.data.item.trim();
  if (field === 'tanggal') return err.startsWith('Tanggal');
  return err.startsWith('Nilai');
};

export const forecastExpenseColumnDefs: ColDef<ForecastExpenseRow>[] = [
  {
    field: 'item',
    headerName: 'Item',
    minWidth: 160,
    editable: true,
    filter: false,
    floatingFilter: false,
    cellClassRules: { 'bg-red-50': invalid('item') },
  },
  {
    field: 'tanggal',
    headerName: 'Tgl',
    width: 150,
    editable: true,
    filter: false,
    floatingFilter: false,
    cellEditor: 'agDateStringCellEditor',
    cellEditorParams: (p: { context: ForecastExpenseContext }) => monthBounds(p.context.bulan),
    valueFormatter: (p) => (p.value ? formatDate(p.value) : ''),
    cellClassRules: { 'bg-red-50': invalid('tanggal') },
  },
  {
    field: 'jumlah',
    headerName: 'Nilai',
    width: 160,
    editable: true,
    filter: false,
    floatingFilter: false,
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: { min: 0, precision: 0, preventStepping: true },
    valueFormatter: (p) => (p.value ? formatRupiah(p.value) : ''),
    cellClassRules: { 'bg-red-50': invalid('jumlah') },
    cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
  },
  {
    headerName: '',
    width: 44,
    minWidth: 44,
    flex: 0,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ForecastDeleteCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  },
];

export const forecastInvoiceColumnDefs: ColDef<Invoice>[] = [
  {
    headerName: '',
    colId: 'tick',
    width: 44,
    minWidth: 44,
    flex: 0,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ForecastTickCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  },
  {
    field: 'no_invoice',
    headerName: 'No. Invoice',
    minWidth: 130,
    tooltipValueGetter: (p) => p.data?.nama_invoice,
  },
  {
    field: 'tgl_tagihan',
    headerName: 'Tgl Submit',
    width: 120,
    valueFormatter: (p) => formatDate(p.value),
  },
  {
    field: 'tgl_bayar',
    headerName: 'Tgl Bayar',
    width: 110,
    valueFormatter: (p) => (p.value ? formatDate(p.value) : '-'),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    cellRendererSelector: (params) => ({
      component: BadgeCellRenderer,
      params: { badgeClasses: invoiceStatusBadgeClasses[params.data?.status ?? ''] },
    }),
  },
  {
    field: 'nilai',
    headerName: 'Nilai Tagihan',
    minWidth: 140,
    cellRenderer: CurrencyCellRenderer,
  },
];

/** The invoice grid has no filters (a short, ticked list), unlike the shared defaults. */
export const forecastInvoiceDefaultColDef: ColDef<Invoice> = {
  flex: 1,
  minWidth: 80,
  sortable: true,
  resizable: true,
  filter: false,
  floatingFilter: false,
  cellStyle: { display: 'flex', alignItems: 'center' },
};
