import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer, CurrencyCellRenderer } from '@/components/ag-grid/cellRenderers';
import { formatDate } from '@/utils/formatters';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { CostOperation } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createCostOperationsColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<CostOperation>): ColDef<CostOperation>[] => [
  {
    field: 'tanggal_transaksi',
    headerName: 'Tanggal',
    width: 120,
    valueFormatter: (p) => formatDate(p.value),
  },
  {
    field: 'operational_cost_type.nama_biaya',
    headerName: 'Jenis Beban',
  },
  {
    field: 'deskripsi',
    headerName: 'Deskripsi',
  },
  {
    field: 'jumlah',
    headerName: 'Jumlah',
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
