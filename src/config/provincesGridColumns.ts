import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Province } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createProvincesColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<Province>): ColDef<Province>[] => [
  {
    field: 'name',
    headerName: 'Nama Provinsi',
  },
  {
    field: 'country.name',
    headerName: 'Negara',
    width: 160,
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
