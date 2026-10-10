import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { City } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createCitiesColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<City>): ColDef<City>[] => [
  {
    field: 'name',
    headerName: 'Nama Kota',
  },
  {
    field: 'province.name',
    headerName: 'Provinsi',
    width: 180,
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
