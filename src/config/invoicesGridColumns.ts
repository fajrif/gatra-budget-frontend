import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer, BadgeCellRenderer, CurrencyCellRenderer } from '@/components/ag-grid/cellRenderers';
import { formatDate } from '@/utils/formatters';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Invoice } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const invoiceStatusBadgeClasses: Record<string, { bg: string; text: string; border: string }> = {
  Submit: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  Clearing: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
};

export const createInvoicesColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<Invoice>): ColDef<Invoice>[] => [
  {
    field: 'no_invoice',
    headerName: 'No. Invoice',
    width: 150,
  },
  {
    field: 'nama_invoice',
    headerName: 'Nama Invoice',
  },
  {
    field: 'project.judul_pekerjaan',
    headerName: 'Proyek',
  },
  {
    field: 'tgl_tagihan',
    headerName: 'Tgl Tagihan',
    width: 130,
    valueFormatter: (p) => formatDate(p.value),
  },
  {
    field: 'tgl_bayar',
    headerName: 'Tgl Bayar',
    width: 130,
    valueFormatter: (p) => (p.value ? formatDate(p.value) : '-'),
  },
  {
    field: 'nilai',
    headerName: 'Nilai',
    cellRenderer: CurrencyCellRenderer,
  },
  {
    field: 'manajemen_fee',
    headerName: 'Manajemen Fee',
    cellRenderer: CurrencyCellRenderer,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 110,
    cellRendererSelector: (params) => ({
      component: BadgeCellRenderer,
      params: { badgeClasses: invoiceStatusBadgeClasses[params.data?.status ?? ''] },
    }),
  },
  {
    headerName: 'Aksi',
    width: 60,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ActionMenuCellRenderer,
    cellRendererParams: { onEdit, onDelete },
  },
];
