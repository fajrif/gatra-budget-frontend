import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';

export { defaultColDef } from '@/config/defaultColDef';

export const createCitiesColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'name',
    headerName: 'City Name',
  },
  {
    field: 'province.name',
    headerName: 'Province',
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
