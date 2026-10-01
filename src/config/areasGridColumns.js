import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';

export { defaultColDef } from '@/config/defaultColDef';

export const createAreasColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'name',
    headerName: 'Area Name',
  },
  {
    field: 'city.name',
    headerName: 'City',
    width: 180,
  },
  {
    headerName: 'Actions',
    field: 'actions',
    width: 60,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ActionMenuCellRenderer,
    cellRendererParams: { onEdit, onDelete },
  },
];
