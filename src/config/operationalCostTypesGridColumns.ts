import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { OperationalCostType } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createOperationalCostTypesColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<OperationalCostType>): ColDef<OperationalCostType>[] => [
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
