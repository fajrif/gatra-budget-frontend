import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer, CurrencyCellRenderer } from '@/components/ag-grid/cellRenderers';
import { formatDate } from '@/utils/formatters';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Transaction } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

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
