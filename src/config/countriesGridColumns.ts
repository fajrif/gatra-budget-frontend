import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Country } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createCountriesColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<Country>): ColDef<Country>[] => [
  {
    field: 'code',
    headerName: 'Kode',
    width: 90,
    cellStyle: { fontWeight: 600, textTransform: 'uppercase' },
  },
  {
    field: 'name',
    headerName: 'Nama Negara',
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
