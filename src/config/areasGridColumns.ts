import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Area } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createAreasColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<Area>): ColDef<Area>[] => [
  {
    field: 'name',
    headerName: 'Nama Kecamatan',
  },
  {
    field: 'city.name',
    headerName: 'Kota',
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
