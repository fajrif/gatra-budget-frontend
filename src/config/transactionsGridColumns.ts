import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer, CurrencyCellRenderer, BadgeCellRenderer } from '@/components/ag-grid/cellRenderers';
import { formatDate } from '@/utils/formatters';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Transaction } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

const slaBadgeClasses: Record<string, { bg: string; text: string; border: string }> = {
  on_time: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  h_plus_1: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  late: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  no_data: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

const slaLabels: Record<string, string> = {
  on_time: 'Tepat Waktu',
  h_plus_1: 'H+1',
  late: 'Terlambat',
  no_data: 'Tidak Ada Data',
};

export const createTransactionsColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<Transaction>): ColDef<Transaction>[] => [
  {
    field: 'tanggal_transaksi',
    headerName: 'Tanggal',
    width: 120,
    valueFormatter: (p) => formatDate(p.value),
  },
  {
    field: 'project.judul_pekerjaan',
    headerName: 'Proyek',
  },
  {
    field: 'cost_type.nama_biaya',
    headerName: 'Jenis Biaya',
  },
  {
    field: 'jumlah_realisasi',
    headerName: 'Jumlah Realisasi',
    cellRenderer: CurrencyCellRenderer,
  },
  {
    field: 'nilai_management_fee',
    headerName: 'Management Fee',
    cellRenderer: CurrencyCellRenderer,
  },
  {
    headerName: 'SLA',
    width: 110,
    // BadgeCellRenderer renders the raw `value`, not `valueFormatted`, so the
    // human label has to come from value itself; the raw status (for color
    // lookup) is read separately from params.data inside the selector.
    valueGetter: (p) => slaLabels[p.data?.sla_status ?? ''] ?? p.data?.sla_status,
    cellRendererSelector: (params) => ({
      component: BadgeCellRenderer,
      params: { badgeClasses: slaBadgeClasses[params.data?.sla_status ?? ''] },
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
