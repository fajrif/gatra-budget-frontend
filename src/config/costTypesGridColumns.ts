import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { CostType } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createCostTypesColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<CostType>): ColDef<CostType>[] => [
  {
    field: 'kode',
    headerName: 'Kode',
    width: 100,
  },
  {
    field: 'nama_biaya',
    headerName: 'Nama Biaya',
  },
  {
    field: 'deskripsi',
    headerName: 'Deskripsi',
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
